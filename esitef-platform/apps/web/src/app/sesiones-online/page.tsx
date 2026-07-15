import type { Metadata } from "next";
import { SesionesOnlineCalendar } from "@/components/sesiones-online/SesionesOnlineCalendar";
import "@/styles/sesiones-online.css";

export const metadata: Metadata = {
  title: "Sesiones online — Fechas disponibles | ESITEF",
  description:
    "Consulta y gestiona las fechas disponibles para sesiones online con el profesorado ESITEF.",
};

export default function SesionesOnlinePage() {
  return (
    <div className="sesiones-online-page">
      <header className="sesiones-online-hero">
        <span className="sesiones-online-hero__eyebrow">Profesorado ESITEF</span>
        <h1>Sesiones online</h1>
        <p className="sesiones-online-hero__lead">
          Calendario de fechas con cupo para sesiones en vivo. Los días
          resaltados están abiertos para reserva o coordinación con alumnos.
        </p>
        <p className="sesiones-online-hero__note">
          Reserva en un solo paso: fecha, horario, datos y pago seguro con Stripe.
        </p>
      </header>

      <SesionesOnlineCalendar />
    </div>
  );
}
