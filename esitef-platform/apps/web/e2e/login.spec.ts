import { test, expect } from "@playwright/test";

const DEMO_EMAIL = process.env.E2E_DEMO_EMAIL ?? "demo@esitef.com";
const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD ?? "demo1234";

test("login demo y acceso al dashboard", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.locator("#password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Continuar aprendiendo" })).toBeVisible();
  await expect(page.getByText("Cursos matriculados")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cursos" })).toBeVisible();
});

test("player de curso demo carga tras login", async ({ page }) => {
  await page.goto("/ingresar?callbackUrl=%2Faprender%2Fintroduccion-esitef");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.locator("#password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/(dashboard|aprender)/, { timeout: 20_000 });
  const res = await page.goto("/aprender/introduccion-esitef");
  expect(res?.status()).toBeLessThan(400);
});
