import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/formaciones",
  "/la-escuela",
  "/contacto",
  "/mentorias",
  "/libros",
  "/articulos",
  "/preguntas-frecuentes",
  "/sesiones-online-con-tomas-bonino",
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
