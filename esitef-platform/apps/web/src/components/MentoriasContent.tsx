"use client";

import Link from "next/link";
import { useState } from "react";

const AYUDAR_TABS = [
  {
    id: "tab1",
    badge: "Perspectivas",
    title: "Darte ideas originales",
    text: "Que no se te habían ocurrido y ofrecerte una visión nueva y distinta sobre tu situación profesional.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    alt: "Ideas originales",
  },
  {
    id: "tab2",
    badge: "Estrategia",
    title: "Potenciar tus fortalezas",
    text: "Ver cómo compensar tus debilidades y organizar tus proyectos e ideas para hacerlas posibles de manera eficaz y real.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
    alt: "Potenciar fortalezas",
  },
  {
    id: "tab3",
    badge: "Desarrollo",
    title: "Salir del estancamiento",
    text: "Con nuevas perspectivas e ideas, focalizando las energías y tiempo en lo que más te importe, liberando tu potencial creativo.",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
    alt: "Salir del estancamiento",
  },
  {
    id: "tab4",
    badge: "Conexión",
    title: "Mejorar la comunicación",
    text: "Sobre lo que piensas y haces en redes, con colegas y con tus pacientes de manera más clara y eficiente.",
    image:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop",
    alt: "Mejorar comunicación",
  },
  {
    id: "tab5",
    badge: "Networking",
    title: "Abrir nuevas puertas",
    text: "Encontrar más y mejores contactos, y orientarte en cómo y dónde encontrar información valiosa que te sirva para tu carrera.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    alt: "Nuevas puertas",
  },
] as const;

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
  const [activeTab, setActiveTab] = useState("tab1");
  const active = AYUDAR_TABS.find((t) => t.id === activeTab) ?? AYUDAR_TABS[0];

  return (
    <>
      <section className="mentorias-hero">
        <div className="hero-bg" />
        <div className="hero-bg-overlay" />
        <div className="mentorias-hero-inner">
          <h1 className="mentorias-title">Mentorías con Tomás</h1>
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
        <h2 className="section-title">Te puedo ayudar a :</h2>
        <div className="ayudar-container">
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
                <span className="tab-badge">{active.badge}</span>
                <h3>{active.title}</h3>
                <p>{active.text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <h2 className="section-title">¿En qué consiste la mentoría?</h2>
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
              <h3>¿Cuánto cuesta?</h3>
            </div>
            <div className="inversion-body">
              <p>
                Por las 3 sesiones individuales + estrategias y herramientas +
                grabaciones, el coste es de <b>695 euros</b>.
              </p>
              <div className="inversion-payments">
                <div className="payment-schedule">
                  <h4>¿Cuándo se paga?</h4>
                  <ul>
                    <li>
                      <strong>€400</strong> — Antes de la primera sesión.
                    </li>
                    <li>
                      <strong>€295</strong> — Tras la primera sesión.
                    </li>
                  </ul>
                </div>
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
