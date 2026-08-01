import type { Metadata } from "next";
import { CalendarioPresencialesLinks } from "@/components/presencial/CalendarioPresencialesLinks";
import { getPresencialCalendarItems } from "@/lib/presencial-calendar";

export const metadata: Metadata = {
  title: "Calendario formaciones presenciales | ESITEF",
  description:
    "Calendario de formaciones presenciales ESITEF por país y sede. Enlaces directos a cada curso.",
};

export default function CalendarioPresencialesPage() {
  const items = getPresencialCalendarItems();

  return (
    <main className="cal-pres-page">
      <CalendarioPresencialesLinks items={items} />
    </main>
  );
}
