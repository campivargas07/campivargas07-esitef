import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/formaciones",
  "/la-escuela",
  "/contacto",
  "/mentorias",
  "/libros",
  "/blog",
  "/articulos",
  "/preguntas-frecuentes",
  "/sesiones-online",
  "/talleres-privados-clinicas",
  "/espana",
  "/ingresar",
];

for (const path of PUBLIC_ROUTES) {
  test(`GET ${path} responde 200`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
  });
}

test("redirect legacy presencial slug", async ({ page }) => {
  const res = await page.goto("/gestion-funcional-fuerzas-medelli");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/gestion-funcional-fuerzas-medellin/);
});

test("redirect legacy sesiones online slug", async ({ page }) => {
  const res = await page.goto("/sesiones-online-con-tomas-bonino");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/sesiones-online$/);
});

test("sesiones-online APIs calendario, disponibilidad y precio", async ({
  request,
}) => {
  const now = new Date();
  const cal = await request.get(
    `/api/sesiones-online/calendario?year=${now.getFullYear()}&month=${now.getMonth()}`,
  );
  expect(cal.status()).toBe(200);
  const calBody = await cal.json();
  expect(calBody).toHaveProperty("availableDates");
  expect(Array.isArray(calBody.availableDates)).toBe(true);

  const precio = await request.get("/api/sesiones-online/precio");
  expect(precio.status()).toBe(200);
  const precioBody = await precio.json();
  expect(precioBody.amountMinor).toBeGreaterThan(0);
  expect(precioBody.formatted).toBeTruthy();

  if (calBody.availableDates.length > 0) {
    const fecha = calBody.availableDates[0] as string;
    const disp = await request.get(
      `/api/sesiones-online/disponibilidad?fecha=${encodeURIComponent(fecha)}`,
    );
    expect(disp.status()).toBe(200);
    const dispBody = await disp.json();
    expect(dispBody).toHaveProperty("openSlots");
  }
});
