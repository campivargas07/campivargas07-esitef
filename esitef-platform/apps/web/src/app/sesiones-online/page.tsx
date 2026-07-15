import type { Metadata } from "next";
import { SesionesOnlineCalendar } from "@/components/sesiones-online/SesionesOnlineCalendar";
import { SesionesOnlineFaqSection } from "@/components/sesiones-online/SesionesOnlineFaqSection";
import { SesionesOnlineInfoAccordion } from "@/components/sesiones-online/SesionesOnlineInfoAccordion";
import { isSesionesOnlineSimulation } from "@/lib/sesiones-online-simulation";
import "@/styles/formacion-hub.css";
import "@/styles/sesiones-online.css";

export const metadata: Metadata = {
  title: "Sesiones online con Tomás | ESITEF",
  description:
    "Sesiones personalizadas online con Tomás: evaluación, plan terapéutico y asesoramiento para profesionales de la salud y el movimiento.",
};

export default function SesionesOnlinePage() {
  const simulation = isSesionesOnlineSimulation();

  return (
    <div className="sesiones-online-layout formacion-hub-page formacion-hub-page--club-de-actualizacion">
      {simulation && (
        <p className="sesiones-online-sim-banner" role="status">
          Simulación — sin Stripe ni Google Calendar
        </p>
      )}
      <div className="sesiones-online-page">
        <header className="sesiones-online-hero">
          <div className="sesiones-online-hero__above-fold">
            <h1>Sesiones online con Tomás</h1>
            <p className="sesiones-online-hero__lede">
              Una sesión personalizada para comprender tu situación, tomar
              consciencia de tu estado y empezar a trabajar activamente en una
              mejora real y sostenible.
            </p>
          </div>

          <div className="sesiones-online-hero__below-fold">
            <div className="sesiones-online-hero__intro">
              <p>
                Tomás evaluará tus capacidades, escuchará tus necesidades y te
                ayudará a entender qué ocurre y cómo abordarlo. A partir de ahí,
                diseñará contigo un plan terapéutico y/o de optimización del
                movimiento, accesible y realista, adaptado a tu nivel: desde
                personas sedentarias hasta deportistas profesionales.
              </p>
            </div>

            <div className="sesiones-online-hero__pro">
              <h2 className="sesiones-online-hero__subheading">
                Para profesionales de la salud o del movimiento
              </h2>
              <p>
                Tomás también ofrece asesoramiento para orientar mejor el trabajo con
                pacientes, clientes o alumnos.
              </p>
              <p>
                Puedes elegir entre una sesión conjunta con tu paciente, cliente o
                alumno, a modo de interconsulta, o una supervisión de casos en la que
                revisar videos, historia clínica y abordaje para profundizar en el
                razonamiento clínico y de movimiento.
              </p>

              <SesionesOnlineInfoAccordion />
            </div>
          </div>
        </header>

        <div className="sesiones-online-calendar-shell">
          <SesionesOnlineCalendar />
        </div>
      </div>

      <SesionesOnlineFaqSection />
    </div>
  );
}
