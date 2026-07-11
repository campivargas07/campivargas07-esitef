import { SesionesOnlineContent } from "@/components/SesionesOnlineContent";
import "@/styles/marketing-servicio.css";

export const metadata = {
  title: "Sesiones online con Tomás Bonino — ESITEF",
  description:
    "Consultas y sesiones online para aplicar el ejercicio terapéutico con tus pacientes.",
};

export default function SesionesOnlinePage() {
  return (
    <main className="site-wrapper">
      <SesionesOnlineContent />
    </main>
  );
}
