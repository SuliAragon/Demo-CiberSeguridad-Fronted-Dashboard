import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("pages and alert detail have no automatically detected WCAG AA violations", async ({
  page,
}) => {
  for (const path of ["/", "/alertas", "/activos"]) {
    await page.goto(path);
    await expect(page.getByText("API conectada", { exact: true })).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .exclude("nextjs-portal")
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  }
  await page.goto("/alertas");
  await expect(page.getByText("API conectada", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Abrir ALT-1048", exact: true }).click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .exclude("nextjs-portal")
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  ).toEqual([]);
});
