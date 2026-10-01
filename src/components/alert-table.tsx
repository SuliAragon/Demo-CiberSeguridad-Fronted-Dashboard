"use client";
import { ArrowUpRight } from "lucide-react";
import type { Alert, Asset } from "@/lib/types";
import { SeverityBadge, StatusBadge, formatDate } from "./ui";
export function AlertTable({
  alerts,
  assets,
  onOpen,
  compact = false,
}: {
  alerts: Alert[];
  assets: Asset[];
  onOpen: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className={`data-table ${compact ? "compact-table" : ""}`}>
        <caption className="sr-only">Alertas de seguridad ordenadas por prioridad</caption>
        <thead>
          <tr>
            <th>Alerta</th>
            <th>Gravedad</th>
            <th>Activo</th>
            <th>Estado</th>
            {!compact && (
              <>
                <th>Responsable</th>
                <th>Detectada</th>
              </>
            )}
            <th>
              <span className="sr-only">Detalle</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id}>
              <td>
                <button className="row-title" onClick={() => onOpen(a.id)}>
                  <strong>{a.title}</strong>
                  <small>
                    {a.id}
                    <span>·</span>
                    {compact ? formatDate(a.detectedAt) : a.source}
                  </small>
                </button>
              </td>
              <td>
                <SeverityBadge severity={a.severity} />
              </td>
              <td>
                <span className="asset-name mono">
                  {assets.find((asset) => asset.id === a.assetId)?.name ?? a.assetId}
                </span>
              </td>
              <td>
                <StatusBadge status={a.status} />
              </td>
              {!compact && (
                <>
                  <td className="owner-cell">
                    {a.owner === "Sin asignar" ? (
                      <span className="muted">Sin asignar</span>
                    ) : (
                      <>
                        <span className="tiny-avatar">
                          {a.owner
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                        {a.owner}
                      </>
                    )}
                  </td>
                  <td className="date-cell">{formatDate(a.detectedAt)}</td>
                </>
              )}
              <td>
                <button
                  className="row-open"
                  aria-label={`Abrir ${a.id}`}
                  onClick={() => onOpen(a.id)}
                >
                  <ArrowUpRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
