import type { Metadata } from "next";
import { PresencialesCatalogo } from "@/components/presencial/PresencialesCatalogo";
import {
  getPresencialesCatalogLinksByKey,
  getPresencialesCatalogo,
} from "@/lib/presenciales";

export const metadata: Metadata = {
  title: "Formaciones Presenciales | ESITEF",
  description:
    "Catálogo de formaciones presenciales de ESITEF: Movement Coaching, programas especializados y postgrado en kinesiología deportiva.",
};

export default function FormacionesPresencialesPage() {
  const catalog = getPresencialesCatalogo();
  const linksByKey = getPresencialesCatalogLinksByKey();

  return (
    <PresencialesCatalogo catalog={catalog} linksByKey={linksByKey} />
  );
}
