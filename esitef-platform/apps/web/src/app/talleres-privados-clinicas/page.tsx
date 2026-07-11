import { TalleresPrivadosContent } from "@/components/TalleresPrivadosContent";
import "@/styles/marketing-servicio.css";

export const metadata = {
  title: "Talleres privados clínicas — ESITEF",
  description:
    "Talleres privados en tu centro para mejorar la calidad asistencial de tu clínica.",
};

export default function TalleresPrivadosPage() {
  return (
    <main className="site-wrapper">
      <TalleresPrivadosContent />
    </main>
  );
}
