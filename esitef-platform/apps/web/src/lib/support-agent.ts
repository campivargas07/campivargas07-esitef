/**
 * ESITEF support agent — decide reply vs human escalate.
 * LLM via Gemini REST (no SDK). Free tier: GEMINI_API_KEY.
 */

import formacionesIndex from "@/data/formaciones-index.json";
import presenciales from "@/data/presenciales.json";

const ESCALATE_RE =
  /\b(hablar\s+con\s+(una?\s+)?(persona|humano|alguien)|quiero\s+hablar\s+con(?:\s+(una?\s+)?(persona|humano|alguien))?|agente\s+humano|atenci[oó]n\s+humana|factura|facturaci[oó]n|reembolso|devoluci[oó]n|queja|reclamaci[oó]n|abogado|demanda|contrase[nñ]a|password|datos\s+bancarios|transferencia\s+ya\s+hecha|pago\s+no\s+reflejado)\b/i;

const SITE = "https://esitef.com";

export type AgentMessage = { role: "user" | "assistant"; content: string };

export type AgentDecision =
  | { action: "reply"; text: string }
  | { action: "escalate"; reason: string };

function catalogBlurb(): string {
  const online = (formacionesIndex as { cards?: { title: string; href: string }[] })
    .cards?.map((c) => {
      const url = c.href.startsWith("http") ? c.href : `${SITE}${c.href}`;
      return `- ${c.title}: ${url}`;
    })
    .join("\n");

  const presencialList = Object.values(
    presenciales as Record<string, { page_title?: string; page_slug?: string }>
  )
    .filter((p) => p.page_slug)
    .map((p) => `- ${p.page_title ?? p.page_slug}: ${SITE}/${p.page_slug}`)
    .slice(0, 12)
    .join("\n");

  return `Formaciones online:\n${online ?? "(ver esitef.com/formaciones)"}\n\nPresenciales:\n${presencialList}`;
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
  // Strip accidental ESCALATE lines mid-body
  const cleaned = trimmed.replace(/^ESCALATE(?:\s*:.*)?$/gim, "").trim();
  if (!cleaned) {
    return { action: "escalate", reason: "model_escalate" };
  }
  return { action: "reply", text: cleaned };
}

function systemPrompt(): string {
  return `Eres el asistente de soporte de ESITEF (Escuela Internacional de Terapia Física).
Responde en español, breve, cordial y profesional. No inventes precios, fechas, plazas ni políticas.
Si no sabes algo con certeza, di que un compañero humano lo confirmará.
Si el usuario pide hablar con una persona, hay queja, facturación/reembolso, o datos sensibles: responde SOLO con la línea:
ESCALATE: <motivo corto>
Sitio: ${SITE}
Contacto humano: info@esitef.com

Catálogo (enlaces oficiales):
${catalogBlurb()}`;
}

async function callGemini(
  history: AgentMessage[]
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
      systemInstruction: { parts: [{ text: systemPrompt() }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
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

  const modelText = await callGemini(input.history);
  if (!modelText) {
    // ponytail: sin API key o fallo Gemini → humano; upgrade: plantilla FAQ local
    return { action: "escalate", reason: "llm_unavailable" };
  }
  return parseModelReply(modelText);
}
