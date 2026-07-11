import { PreguntasFrecuentesContent } from "@/components/PreguntasFrecuentesContent";
import "@/styles/marketing-servicio.css";
import "@/styles/faq.css";

export const metadata = {
  title: "Preguntas frecuentes — ESITEF",
  description: "Ayuda sobre formaciones, pagos, sesiones online y certificados.",
};

export default function PreguntasFrecuentesPage() {
  return (
    <main className="site-wrapper">
      <PreguntasFrecuentesContent />
    </main>
  );
}
