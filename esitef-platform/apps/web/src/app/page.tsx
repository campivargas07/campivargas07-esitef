import type { Metadata } from "next";
import { HomeBlogSection } from "@/components/blog/HomeBlogSection";
import { HomeAccordion } from "@/components/HomeAccordion";
import { HomeHero } from "@/components/HomeHero";

export const metadata: Metadata = {
  title: "ESITEF — Formación para profesionales de salud",
  description:
    "Formación online y presencial en fisioterapia y ejercicio terapéutico.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAccordion />
      <HomeBlogSection />
    </>
  );
}
