/**
 * ESITEF support agent — decide reply vs human escalate.
 * LLM via Gemini REST (no SDK). Free tier: GEMINI_API_KEY.
 *
 * Knowledge = JSON del repo (presenciales + formaciones online), no fine-tuning.
 */

import formacionesIndex from "@/data/formaciones-index.json";
import paises from "@/data/paises.json";
import presenciales from "@/data/presenciales.json";

const ESCALATE_RE =
  /\b(hablar\s+con\s+(una?\s+)?(persona|humano|alguien)|quiero\s+hablar\s+con(?:\s+(una?\s+)?(persona|humano|alguien))?|agente\s+humano|atenci[oó]n\s+humana|factura|facturaci[oó]n|reembolso|devoluci[oó]n|queja|reclamaci[oó]n|abogado|demanda|contrase[nñ]a|password|datos\s+bancarios|transferencia\s+ya\s+hecha|pago\s+no\s+reflejado)\b/i;

const SITE = "https://esitef.com";

export type AgentMessage = { role: "user" | "assistant"; content: string };

export type AgentDecision =
  | { action: "reply"; text: string }
  | { action: "escalate"; reason: string };

type PresencialRow = {
  page_title?: string;
  page_slug?: string;
  sede?: string;
  pais?: string;
  status?: "past";
  hero_meta?: { icon?: string; value?: string }[];
  stats?: { key?: string; label?: string; value?: string }[];
  inscription?: { investment?: string; deposit?: string };
};

function heroDate(p: PresencialRow): string {
  return (
    p.hero_meta?.find((m) => m.icon === "calendar")?.value?.trim() ||
    "consultar fechas en la web"
  );
}

function investment(p: PresencialRow): string {
  const fromStats = p.stats?.find(
    (s) => s.key === "inversion" || /inversi/i.test(s.label ?? "")
  )?.value;
  return (
    fromStats?.trim() ||
    p.inscription?.investment?.trim() ||
    "consultar inversión en la web / organizador"
  );
}

function allPresencialesLines(): string {
  return Object.values(presenciales as Record<string, PresencialRow>)
    .filter((p) => p.page_slug && p.status !== "past")
    .map((p) => {
      const sede = p.sede || "—";
      return `- [${sede}] ${p.page_title ?? p.page_slug} | fechas: ${heroDate(p)} | inversión: ${investment(p)} | ${SITE}/${p.page_slug}`;
    })
    .join("\n");
}

function onlineLines(): string {
  return (
    (formacionesIndex as { cards?: { title: string; href: string }[] }).cards
      ?.map((c) => {
        const url = c.href.startsWith("http") ? c.href : `${SITE}${c.href}`;
        return `- ${c.title}: ${url}`;
      })
      .join("\n") ?? ""
  );
}

function isPastSlug(slug: string | undefined): boolean {
  if (!slug) return true;
  return (presenciales as Record<string, PresencialRow>)[slug]?.status === "past";
}

function sedeIndexLines(): string {
  const rows: string[] = [];
  const bySlug = paises as Record<
    string,
    {
      title?: string;
      sedes?: {
        slug: string;
        name: string;
        courses?: { title: string; page_slug?: string; dates?: string }[];
      }[];
    }
  >;
  for (const pais of Object.values(bySlug)) {
    for (const sede of pais.sedes ?? []) {
      const courses = (sede.courses ?? [])
        .filter((c) => c.page_slug && !isPastSlug(c.page_slug))
        .map(
          (c) =>
            `${c.title}${c.dates ? ` (${c.dates})` : ""} → ${SITE}/${c.page_slug}`
        )
        .join("; ");
      if (courses) {
        rows.push(`- ${sede.name} (${pais.title ?? ""}): ${courses}`);
      }
    }
  }
  return rows.join("\n");
}

/** Extra context when the user names a city/sede (keeps prompt focused). */
export function cityFocusBlurb(userText: string): string {
  const text = userText.toLowerCase();
  const matches = Object.values(presenciales as Record<string, PresencialRow>)
    .filter((p) => p.page_slug && p.sede && p.status !== "past")
    .filter((p) => {
      const sede = (p.sede ?? "").toLowerCase();
      const title = (p.page_title ?? "").toLowerCase();
      return (
        text.includes(sede) ||
        (sede === "cdmx" &&
          (text.includes("cdmx") ||
            text.includes("ciudad de mexico") ||
            text.includes("ciudad de méxico"))) ||
        (sede === "gdl" && text.includes("guadalajara")) ||
        title.split(/[—\-]/).some((part) => {
          const city = part.trim().toLowerCase();
          return city.length > 3 && text.includes(city);
        })
      );
    });

  if (!matches.length) return "";

  const lines = matches.map(
    (p) =>
      `- ${p.page_title} | sede=${p.sede} | fechas: ${heroDate(p)} | ${investment(p)} | ${SITE}/${p.page_slug}`
  );
  return `\nConsulta parece sobre ciudad/sede concreta. Prioriza SOLO estas formaciones:\n${lines.join("\n")}\nSi pregunta por esa ciudad, lista estas con enlace. No digas que no hay si aparecen aquí.`;
}

export function catalogBlurb(): string {
  return `Formaciones online:\n${onlineLines()}\n\nÍndice por sede (país):\n${sedeIndexLines()}\n\nPresenciales (detalle):\n${allPresencialesLines()}\n\nListado general: ${SITE}/formaciones-presenciales`;
}

export function shouldEscalateHeuristically(text: string): string | null {
  const m = text.match(ESCALATE_RE);
  return m ? `keyword:${m[0]}` : null;
}

export function parseModelReply(raw: string): AgentDecision {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { action: "escalate", reason: "empty_model_reply" };
  }
  const escalateMatch = trimmed.match(/^ESCALATE(?:\s*:\s*(.+))?$/im);
  if (escalateMatch) {
    return {
      action: "escalate",
      reason: escalateMatch[1]?.trim() || "model_escalate",
    };
  }
  const cleaned = trimmed.replace(/^ESCALATE(?:\s*:.*)?$/gim, "").trim();
  if (!cleaned) {
    return { action: "escalate", reason: "model_escalate" };
  }
  return { action: "reply", text: cleaned };
}

function systemPrompt(latestUserText: string): string {
  return `Eres el asistente de soporte de ESITEF (Escuela Internacional de Terapia Física).
Responde en español, breve, cordial y profesional.
Reglas:
- Usa SOLO el catálogo abajo. No inventes formaciones, sedes, precios ni fechas.
- Si preguntan por una ciudad/sede (ej. Guadalajara, Madrid, Córdoba): lista las formaciones de esa sede con título, fechas si constan, y el enlace https://esitef.com/<slug>.
- Si en el catálogo no hay nada en esa ciudad, dilo claro y ofrece ${SITE}/formaciones-presenciales y formaciones online.
- Para precios exactos o plazas: si el catálogo dice "consultar", indícalo y ofrece escribir a info@esitef.com.
- Si piden hablar con una persona, hay queja, facturación/reembolso o datos sensibles: responde SOLO con la línea:
ESCALATE: <motivo corto>

Sitio: ${SITE}
Contacto humano: info@esitef.com

${catalogBlurb()}
${cityFocusBlurb(latestUserText)}`;
}

async function callGemini(
  history: AgentMessage[],
  latestUserText: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model =
    process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(latestUserText) }] },
      contents,
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
    }),
  });

  if (!res.ok) {
    console.error("[support-agent:gemini]", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  return text || null;
}

/** Decide reply or escalate for the latest inbound user text. */
export async function decideSupportReply(input: {
  history: AgentMessage[];
  latestUserText: string;
}): Promise<AgentDecision> {
  const heuristic = shouldEscalateHeuristically(input.latestUserText);
  if (heuristic) {
    return { action: "escalate", reason: heuristic };
  }

  const modelText = await callGemini(input.history, input.latestUserText);
  if (!modelText) {
    // ponytail: sin API key o fallo Gemini → humano; upgrade: plantilla FAQ local
    return { action: "escalate", reason: "llm_unavailable" };
  }
  return parseModelReply(modelText);
}
