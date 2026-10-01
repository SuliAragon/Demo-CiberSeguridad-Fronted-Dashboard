import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function ready(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByText("API conectada", { exact: true })).toBeVisible();
}
test("overview explains risk, changes period and exports a report", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await expect(page.getByRole("heading", { name: "Tu perímetro, de un vistazo." })).toBeVisible();
  await expect(page.locator(".risk-gauge strong")).toHaveText("51/100");
  await page.screenshot({
    path: `docs/screenshots/overview-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "30 días", exact: true }).click();
  await expect(page.getByRole("img", { name: /30 días/ })).toBeVisible();
  await page.getByRole("button", { name: "7 días", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar informe" }).click();
  const download = await downloadPromise;
  const content = await readFile((await download.path())!, "utf8");
  expect(content).toContain('"Alertas activas","8"');
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
test("critical alert can be assigned, investigated, resolved and persists after reload", async ({
  page,
}, info) => {
  await ready(page, "/alertas?gravedad=critical");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("184 intentos fallidos en 5 minutos", { exact: true }),
  ).toBeVisible();
  await dialog.getByLabel("Responsable", { exact: true }).selectOption("Ana García");
  await dialog.getByLabel("Estado", { exact: true }).selectOption("investigating");
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  await expect(dialog.getByLabel("Responsable", { exact: true })).toHaveValue("Ana García");
  await expect(dialog.getByLabel("Estado", { exact: true })).toHaveValue("investigating");
  await page.screenshot({ path: `docs/screenshots/alert-detail-${info.project.name}.png` });
  await dialog.getByLabel("Estado", { exact: true }).selectOption("resolved");
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.reload();
  await expect(page.getByText("API conectada", { exact: true })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: /Resueltas/ }).click();
  await expect(page.getByRole("button", { name: "Abrir ALT-1048", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  await expect(dialog.getByLabel("Estado", { exact: true })).toHaveValue("resolved");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
test("alert search, empty state, filters, sorting, pagination and CSV work together", async ({
  page,
}, info) => {
  await ready(page, "/alertas");
  await page.screenshot({
    path: `docs/screenshots/alerts-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByPlaceholder("Buscar alerta, activo o responsable…").fill("no-existe");
  await expect(
    page.getByRole("heading", { name: "No hay alertas con estos filtros" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restablecer filtros" }).last().click();
  await page.getByRole("button", { name: "Página siguiente" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await page.getByRole("button", { name: "Página anterior" }).click();
  await page.getByLabel("Ordenar alertas").selectOption("recent");
  await page.getByLabel("Filtrar por gravedad").selectOption("critical");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const content = await readFile((await (await downloadPromise).path())!, "utf8");
  expect(content).toContain("ALT-1048");
  expect(content).not.toContain("ALT-1046");
  await page.getByRole("button", { name: "Restablecer filtros" }).click();
  await page.getByRole("button", { name: "Revisar críticas" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
});
test("inventory supports contextual detail, filtering, grid view and exports", async ({
  page,
}, info) => {
  await ready(page, "/activos");
  await page.screenshot({
    path: `docs/screenshots/assets-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByLabel("Ordenar activos").selectOption("name");
  await page.getByRole("button", { name: "Página siguiente" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await page.getByLabel("Tipo de activo", { exact: true }).selectOption("Cloud");
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByLabel("Entorno", { exact: true }).selectOption("Staging");
  await expect(
    page.getByRole("heading", { name: "No hay activos con estos filtros" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restablecer filtros" }).last().click();
  await page.getByLabel("Nivel de riesgo").selectOption("alto");
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("button", { name: "Vista de tarjetas" }).click();
  await expect(page.locator(".inventory-card")).toHaveCount(5);
  await page.getByPlaceholder("Buscar por nombre, IP o propietario…").fill("10.0.1.12");
  await expect(page.locator(".inventory-card")).toHaveCount(1);
  await page.locator(".inventory-card").click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "api-prod-01", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Intentos de acceso por fuerza bruta/ })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Intentos de acceso por fuerza bruta", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /ACTIVO AFECTADO/ })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "api-prod-01", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const content = await readFile((await (await downloadPromise).path())!, "utf8");
  expect(content).toContain("api-prod-01");
  expect(content).not.toContain("db-primary");
  await page.getByRole("button", { name: "Restablecer filtros" }).click();
  await page.getByRole("button", { name: "Vista de tabla" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
test("API failure supports retry, and failed mutations leave the alert unchanged", async ({
  page,
}) => {
  await page.route("**/api/assets", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".error-banner")).toContainText("No se ha podido conectar");
  await page.unroute("**/api/assets");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText("API conectada", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  await page.route("**/api/alerts/ALT-1048", (route) =>
    route.fulfill({ status: 500, body: '{"error":"demo"}' }),
  );
  await page.getByRole("dialog").getByLabel("Estado", { exact: true }).selectOption("resolved");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("No se han guardado");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  await expect(page.getByRole("dialog").getByLabel("Estado", { exact: true })).toHaveValue("open");
});
test("navigation, help, reset and keyboard dismissal are usable", async ({ page }, info) => {
  await ready(page);
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await page.getByRole("link", { name: "Inventario de activos", exact: true }).click();
  await expect(page).toHaveURL(/activos/);
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await page.getByRole("button", { name: "Ayuda y documentación", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Tu primera vuelta por Sentinel" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restablecer demo" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Actualizar datos" }).click();
  await expect(page.getByText("API conectada", { exact: true })).toBeVisible();
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await page.getByRole("link", { name: "Vista general", exact: true }).click();
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("API validates mutation input and returns explicit errors", async ({ request }) => {
  expect((await request.get("/api/alerts")).status()).toBe(200);
  const valid = await request.patch("/api/alerts/ALT-1048", {
    data: { status: "resolved", owner: "Ana García" },
  });
  expect(valid.status()).toBe(200);
  expect((await valid.json()).data.status).toBe("resolved");
  expect(
    (
      await request.patch("/api/alerts/ALT-1048", {
        data: { status: "deleted", owner: "Ana García" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.patch("/api/alerts/ALT-1048", {
        data: "bad json",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.patch("/api/alerts/unknown", { data: { status: "open", owner: "Sin asignar" } })
    ).status(),
  ).toBe(404);
  // El servidor es deliberadamente stateless: los cambios pertenecen a cada navegador.
  expect(
    (await (await request.get("/api/alerts")).json()).data.find(
      (a: { id: string }) => a.id === "ALT-1048",
    ).status,
  ).toBe("open");
});
