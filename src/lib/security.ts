import type { Alert, Severity } from "./types";
const priority: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
export function prioritizeAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort(
    (a, b) =>
      Number(a.status === "resolved") - Number(b.status === "resolved") ||
      priority[a.severity] - priority[b.severity] ||
      Date.parse(b.detectedAt) - Date.parse(a.detectedAt),
  );
}
export function riskLevel(score: number): Severity {
  return score >= 80 ? "critical" : score >= 60 ? "high" : score >= 30 ? "medium" : "low";
}
