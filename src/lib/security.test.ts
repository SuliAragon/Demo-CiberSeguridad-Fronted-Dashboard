import { expect, it } from "vitest";
import { prioritizeAlerts, riskLevel } from "./security";
import type { Alert } from "./types";
const alert = (
  id: string,
  severity: Alert["severity"],
  status: Alert["status"] = "open",
  detectedAt = "2026-10-01T08:00:00Z",
) => ({ id, severity, status, detectedAt }) as Alert;
it("prioritizes unresolved critical alerts before lower severity and resolved alerts", () => {
  const items = [
    alert("low", "low"),
    alert("resolved", "critical", "resolved"),
    alert("high", "high"),
    alert("critical", "critical"),
  ];
  expect(prioritizeAlerts(items).map((a) => a.id)).toEqual(["critical", "high", "low", "resolved"]);
  expect(items[0].id).toBe("low");
});
it("classifies risk at the exact 30, 60 and 80 boundaries", () => {
  expect([0, 29, 30, 59, 60, 79, 80, 100].map(riskLevel)).toEqual([
    "low",
    "low",
    "medium",
    "medium",
    "high",
    "high",
    "critical",
    "critical",
  ]);
});
