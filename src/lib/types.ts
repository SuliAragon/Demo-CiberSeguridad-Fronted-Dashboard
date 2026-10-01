export type Severity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "open" | "investigating" | "resolved";
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  assetId: string;
  source: string;
  detectedAt: string;
  owner: string;
  evidence: string[];
  recommendation: string;
}
export interface Asset {
  id: string;
  name: string;
  type: "Servidor" | "Endpoint" | "Cloud" | "Red";
  ip: string;
  environment: "Producción" | "Staging" | "Corporativo";
  owner: string;
  os: string;
  risk: number;
  monitored: boolean;
  vulnerabilities: number;
  lastSeen: string;
  tags: string[];
}
export type AlertUpdate = Pick<Alert, "status" | "owner">;
export const analysts = ["Sin asignar", "Ana García", "Marcos Ruiz", "Lucía Torres"] as const;
export const severityLabels: Record<Severity, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};
export const statusLabels: Record<AlertStatus, string> = {
  open: "Abierta",
  investigating: "En investigación",
  resolved: "Resuelta",
};
