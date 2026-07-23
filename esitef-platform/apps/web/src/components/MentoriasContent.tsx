"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const MOBILE_MQ = "(max-width: 991px)";

type AyudarTab = {
  id: string;
  title: string;
  points: ReactNode[];
  image: string;
  alt: string;
};

const AYUDAR_TABS: AyudarTab[] = [
  {
    id: "ideas",
    title: "Ideas",
    points: [
      <>
        Darte <strong>ideas originales</strong> que no se te habían ocurrido.
      </>,
      <>
        Ofrecerte una <strong>visión nueva y distinta</strong> sobre tu
        situación profesional.
      </>,
      <>
        Ver <strong>nuevas opciones</strong> y distintas formas de resolver las
        dificultades actuales.
      </>,
      <>
        <strong>Potenciar tus fortalezas</strong> y ver cómo compensar tus
        debilidades.
      </>,
    ],
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    alt: "Ideas",
  },
  {
    id: "potenciar",
    title: "Potenciar",
    points: [
      <>
        <strong>Organizar tus proyectos</strong> e ideas para hacerlas posibles.
      </>,
      <>
        Poner en orden tus conocimientos para{" "}
        <strong>enfrentarte al paciente</strong> de una mejor forma.
      </>,
      <>
        Saber <strong>qué priorizar</strong>, y por qué, dentro de todo lo que.
      </>,
      <>
        Entender qué debes <strong>potenciar</strong> de todo lo que haces.
      </>,
    ],
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
    alt: "Potenciar",
  },
  {
    id: "impulso",
    title: "Impulso",
    points: [
      <>
        Salir del <strong>estancamiento profesional</strong> con nuevas
        perspectivas e ideas.
      </>,
      <>
        <strong>Focalizar las energías y tiempo</strong> en lo que más te
        importe.
      </>,
      <>
        Mejorar la <strong>comunicación</strong> sobre lo que piensas y haces en
        redes, con colegas y con tus pacientes.
      </>,
      <>
        Ver cómo <strong>abrir puertas</strong> para encontrar más y mejores
        contactos e información.
      </>,
    ],
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
    alt: "Impulso",
  },
  {
    id: "brujula",
    title: "Brújula",
    points: [
      <>
        Orientarte en cómo y dónde encontrar{" "}
        <strong>información que te sirva</strong>.
      </>,
      <>
        Aprender <strong>nuevas y distintas formas de ejercer</strong> la
        profesión, dentro de lo que te interesa y te gusta.
      </>,
      <>
        Ayudarte a poner en orden lo que sabes para{" "}
        <strong>crear un taller o curso</strong> al respecto.
      </>,
      <>
        Preparar <strong>charlas, clases o material</strong> que necesites tener
        listo.
      </>,
    ],
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    alt: "Brújula",
  },
];

function AyudarTabPoints({ points }: { points: ReactNode[] }) {
  return (
    <ul className="ayudar-tab-points">
      {points.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  );
}

const TESTIMONIOS = [
  {
    text: "En un momento crítico de mi vida a nivel académico, laboral y existencial, con una tesis doctoral pronta a entregar, Tomás me ayudó a poner en orden mis ideas y tareas pendientes estratégicamente.",
    name: "Edis",
    role: "Docente universitaria y bailarina (Bogotá, COL)",
  },
  {
    text: "Trabajar con Tomás ha sido un antes y un después. Me ayudó a entender 'la soledad del líder' y a fundar mi propia empresa.",
    name: "Ernesto",
    role: "Fisioterapeuta (Asunción, PAR)",
  },
  {
    text: "Me ayudó a replantear completamente mi estructura de trabajo. Hoy atiendo alrededor de 6 pacientes al día y recuperé mi tiempo personal.",
    name: "Pedro",
    role: "Fisioterapeuta (Ensenada, MEX)",
  },
  {
    text: "Pude redefinir mi carrera desde perspectivas que no imaginaba posibles. Contar con su perspectiva ha supuesto un antes y un después.",
    name: "Miguel",
    role: "Entrenador (Villajoyosa, ESP)",
  },
  {
    text: "Ha sido una ayuda enorme para sacar adelante mi proyecto. Me ayudó a dar forma a mis ideas y convertirlas en un proyecto real.",
    name: "Eugenia",
    role: "Fisioterapeuta (Donosti, ESP)",
  },
  {
    text: "Tomás me orientó poniendo foco en lo que era realmente importante. Me dio el hilo del que tirar para ver mi trabajo desde otro punto de vista.",
    name: "Noelia",
    role: "Fisioterapeuta (Murcia, ESP)",
  },
];

export function MentoriasContent() {
  const [activeTab, setActiveTab] = useState("ideas");
  const [isMobile, setIsMobile] = useState(false);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratiosRef = useRef<Record<number, number>>({});
  const active = AYUDAR_TABS.find((t) => t.id === activeTab) ?? AYUDAR_TABS[0];

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) {
            ratiosRef.current[index] = entry.intersectionRatio;
          }
        }

        const [best] = Object.entries(ratiosRef.current).sort(
          ([, ratioA], [, ratioB]) => ratioB - ratioA
        );
        if (best && best[1] > 0) {
          setActiveTab(AYUDAR_TABS[Number(best[0])].id);
        }
      },
      {
        threshold: Array.from({ length: 11 }, (_, index) => index / 10),
        rootMargin: "-18% 0px -18% 0px",
      }
    );

    for (const item of mobileItemRefs.current) {
      if (item) observer.observe(item);
    }

    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <>
      <section className="mentorias-hero">
        <div className="hero-bg" />
        <div className="hero-bg-overlay" />
        <div className="mentorias-hero-inner">
          <h1 className="mentorias-title">Mentoría con Tomás</h1>
          <p className="mentorias-subtitle">
            para profesionales que se atreven a pensar diferente
          </p>
        </div>
      </section>

      <section className="section-padding" id="contacto">
        <div className="contraste-section">
          <div className="contraste-card yes">
            <h3>Puedo ser tu mentor si buscas...</h3>
            <p>
              Un punto de vista fresco y diferente sobre tu situación profesional.
              Si te animas a cuestionar lo establecido. Si deseas cambiar tu forma
              de hacer las cosas y crear una forma de trabajo que te satisfaga.
            </p>
          </div>
          <div className="contraste-card no">
            <h3>No soy tu mentor ideal si buscas...</h3>
            <p>
              Soluciones mágicas, consejos fáciles o las «10 claves del éxito
              profesional».
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: "transparent" }}>
        <h2 className="section-title mentorias-section-heading">
          Te puedo ayudar a:
        </h2>
        <div className="ayudar-container ayudar-desktop">
          <div className="ayudar-nav-wrapper">
            {AYUDAR_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ayudar-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="ayudar-content-wrapper">
            <div className="ayudar-tab-pane active">
              <div className="ayudar-tab-img">
                <img src={active.image} alt={active.alt} />
              </div>
              <div className="ayudar-tab-text">
                <AyudarTabPoints points={active.points} />
              </div>
            </div>
          </div>
        </div>
        <div className="ayudar-mobile">
          {AYUDAR_TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                ref={(element) => {
                  mobileItemRefs.current[index] = element;
                }}
                data-index={index}
                className={`ayudar-mobile-item${isActive ? " active" : ""}`}
              >
                <button
                  type="button"
                  className="ayudar-mobile-trigger"
                  aria-expanded={isActive}
                  aria-controls={`${tab.id}-mobile-panel`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.title}
                  <span aria-hidden="true">+</span>
                </button>
                <div
                  id={`${tab.id}-mobile-panel`}
                  className="ayudar-mobile-panel"
                  aria-hidden={!isActive}
                >
                  <div className="ayudar-tab-text">
                    <AyudarTabPoints points={tab.points} />
                  </div>
                  <div className="ayudar-tab-img">
                    <img src={tab.image} alt={tab.alt} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-padding">
        <h2 className="section-title mentorias-section-heading">
          ¿En qué consiste la mentoría?
        </h2>
        <div className="timeline-container">
          <div className="timeline-wrapper">
            <div className="timeline-item">
              <div className="timeline-content">
                <h3>Paso 1: Acceso y Evaluación</h3>
                <p>
                  Escríbeme contándome un resumen de lo que te preocupa y en qué
                  querrías que yo te pudiera ayudar. Analizaré si puedo aportarte
                  valor y te responderé para acordar la primera sesión.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <h3>Paso 2: Las sesiones de mentoría</h3>
                <p>
                  Encuentros ONLINE individuales de 1 hora y media por Zoom. Cada
                  sesión se grabará y se te enviará para que puedas revisarla.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <h3>¿Cuántas sesiones serían?</h3>
                <p>
                  Estipulamos un inicio de 3 sesiones. Si hacen falta más, lo
                  decidiremos juntos al finalizar cada encuentro.
                </p>
              </div>
            </div>
          </div>

          <div className="inversion-card">
            <div className="inversion-header">
              <h3 className="mentorias-section-heading">¿Cuánto cuesta?</h3>
            </div>

            <div className="inversion-payments" style={{ marginBottom: 40 }}>
              <div className="payment-schedule">
                <h4>¿Cuándo se paga?</h4>
                <ul>
                  <li>
                    <strong>€400</strong> — Una vez te responda aceptándote al
                    proceso de mentoría y antes de la primera sesión.
                  </li>
                  <li>
                    <strong>€295</strong> — Tras la primera sesión y antes de la
                    segunda.
                  </li>
                </ul>
              </div>

              <div className="payment-methods">
                <h4>¿Cómo o dónde lo pago?</h4>
                <p>
                  Una vez aprobado el acceso, se te enviarán los enlaces para
                  pagar mediante:
                </p>
                <ul className="methods-list">
                  <li>Tarjeta de crédito/débito</li>
                  <li>PayPal</li>
                  <li>Bizum</li>
                  <li>Transferencia bancaria</li>
                  <li>Mercado Pago (LATAM)</li>
                </ul>
              </div>
            </div>

            <div className="inversion-body">
              <p>
                Este tema siempre es difícil de estipular en algo tan abierto
                como esto. Por el conjunto de la lectura y análisis de tu caso +
                las 3 sesiones individuales de hora y media cada una + todas las
                estrategias y herramientas a implementar + que tengas las
                grabaciones de las sesiones para siempre, tiene un coste de{" "}
                <b>695 euros</b>.
              </p>
              <p>
                No es que sienta que tenga que explicar el por qué de esta
                cantidad pero considero que todo lo que te vas a llevar y te va
                a sumar este proceso es de muy alto valor. Supondrá un cambio y
                una mejora en tu vida profesional desde que lo hagamos para
                siempre Y el coste económico sólo algo puntual.
              </p>
              <p>
                Voy a poner toda la carne en asador. Todo mi conocimiento,
                experiencia, creatividad y 25 años de vivencias profesionales a
                tu disposición.
              </p>
              <p>
                Es claro que quizás esta suma no es para todo el mundo. Pero lo
                que vale, cuesta.
              </p>

              <div className="inversion-highlight">
                <strong>¿Necesitas más sesiones?</strong>
                <br />
                Si luego fueran necesarias más sesiones, tendrán un coste de 200
                euros cada una si son únicas o podemos ver entre ambos otro plan
                si es que requieres más acompañamiento.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: "#fff" }}>
        <div className="perfil-section">
          <div className="perfil-img">
            <img
              src="/img/Tomas_Bonino.jpg"
              alt="Tomás Bonino"
            />
          </div>
          <div className="perfil-content">
            <h3>¿Quién es Tomás?</h3>
            <h4>
              Fisioterapeuta / Movement Coach / Emprendedor / Comunicador /
              Investigador / Escritor / Docente
            </h4>
            <p>
              Fundador y director de ESITEF desde 2007. Movement coach con más de
              25 años de experiencia internacional.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <h2 className="section-title">Testimonios de mentorizados</h2>
        <div className="testimonios-grid">
          {TESTIMONIOS.map((t) => (
            <div key={t.name} className="testimonio-card">
              <p className="testimonio-text">{t.text}</p>
              <div className="testimonio-author">
                <div className="author-info">
                  <h5>{t.name}</h5>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding" style={{ textAlign: "center" }}>
        <Link href="/contacto" className="btn-mentorias-cta">
          Solicitar mentoría
        </Link>
      </section>
    </>
  );
}
