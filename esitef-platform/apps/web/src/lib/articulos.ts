import articulosData from "@/data/articulos.json";

export type Articulo = {
  key: string;
  title: string;
  image: string;
  pdf_url?: string;
  pdf?: string;
};

const articulos = articulosData as Record<string, Articulo>;

export const ARTICULOS = Object.values(articulos);

export function getArticulos() {
  return ARTICULOS;
}
