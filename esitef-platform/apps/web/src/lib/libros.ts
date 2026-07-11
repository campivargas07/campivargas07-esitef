import librosData from "@/data/libros.json";

export type Libro = {
  key: string;
  title: string;
  image: string;
  form_slug: string;
  form_path: string;
  pdf_url?: string;
  pdf?: string;
};

const libros = librosData as Record<string, Libro>;

export const LIBROS = Object.values(libros);
export const LIBRO_FORM_SLUGS = LIBROS.map((b) => b.form_slug);

export function getLibros() {
  return LIBROS;
}

export function getLibroByFormSlug(formSlug: string) {
  return LIBROS.find((b) => b.form_slug === formSlug) ?? null;
}

export function getLibroByKey(key: string) {
  return LIBROS.find((b) => b.key === key) ?? null;
}

export const LIBRO_PROFESIONES = [
  "Fisioterapeuta / Kinesiólogo",
  "Preparación / Educación física",
  "Profesiones del movimiento",
  "Otro",
] as const;
