export type LibroCountry = {
  iso2: string;
  name: string;
  dial: string;
};

/** Países ESITEF + frecuentes en formularios de descarga. */
export const LIBRO_COUNTRIES: LibroCountry[] = [
  { iso2: "ES", name: "España", dial: "+34" },
  { iso2: "PE", name: "Perú", dial: "+51" },
  { iso2: "AR", name: "Argentina", dial: "+54" },
  { iso2: "MX", name: "México", dial: "+52" },
  { iso2: "CO", name: "Colombia", dial: "+57" },
  { iso2: "UY", name: "Uruguay", dial: "+598" },
  { iso2: "CL", name: "Chile", dial: "+56" },
  { iso2: "EC", name: "Ecuador", dial: "+593" },
  { iso2: "BO", name: "Bolivia", dial: "+591" },
  { iso2: "PY", name: "Paraguay", dial: "+595" },
  { iso2: "VE", name: "Venezuela", dial: "+58" },
  { iso2: "BR", name: "Brasil", dial: "+55" },
  { iso2: "CR", name: "Costa Rica", dial: "+506" },
  { iso2: "PA", name: "Panamá", dial: "+507" },
  { iso2: "GT", name: "Guatemala", dial: "+502" },
  { iso2: "HN", name: "Honduras", dial: "+504" },
  { iso2: "SV", name: "El Salvador", dial: "+503" },
  { iso2: "NI", name: "Nicaragua", dial: "+505" },
  { iso2: "DO", name: "República Dominicana", dial: "+1-809" },
  { iso2: "CU", name: "Cuba", dial: "+53" },
  { iso2: "PT", name: "Portugal", dial: "+351" },
  { iso2: "IT", name: "Italia", dial: "+39" },
  { iso2: "FR", name: "Francia", dial: "+33" },
  { iso2: "DE", name: "Alemania", dial: "+49" },
  { iso2: "GB", name: "Reino Unido", dial: "+44" },
  { iso2: "US", name: "Estados Unidos", dial: "+1" },
  { iso2: "CA", name: "Canadá", dial: "+1" },
];

export function getLibroCountryByIso(iso2: string) {
  return LIBRO_COUNTRIES.find((c) => c.iso2 === iso2) ?? LIBRO_COUNTRIES[0];
}

export function getLibroCountryByName(name: string) {
  const normalized = name.trim().toLowerCase();
  return (
    LIBRO_COUNTRIES.find((c) => c.name.toLowerCase() === normalized) ??
    LIBRO_COUNTRIES[0]
  );
}

export function formatLibroPhone(dial: string, number: string) {
  const digits = number.replace(/\D/g, "");
  return `${dial} ${digits}`.trim();
}
