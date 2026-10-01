"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  Bell,
  Layers,
  Radar,
  Download,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useSecurity } from "./security-provider";
import { Metric, SectionTitle, SeverityBadge } from "./ui";
import { AlertTable } from "./alert-table";
import { DetailPanel, type Selection } from "./details";
import { prioritizeAlerts, riskLevel } from "@/lib/security";
import { riskHistory } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { severityLabels, type Severity } from "@/lib/types";
export function Overview() {
  const { alerts, assets, notify } = useSecurity();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [selection, setSelection] = useState<Selection>(null);
  const active = prioritizeAlerts(alerts.filter((a) => a.status !== "resolved"));
  const critical = active.filter((a) => a.severity === "critical").length;
  const exposed = assets.filter((a) => a.risk >= 60).sort((a, b) => b.risk - a.risk);
  const monitored = assets.filter((a) => a.monitored).length;
  const score = assets.length
    ? Math.round(assets.reduce((sum, a) => sum + a.risk, 0) / assets.length)
    : 0;
  const history = riskHistory[period];
  const points = history
    .map((value, i) => `${40 + (i * 540) / (history.length - 1)},${185 - value * 1.65}`)
    .join(" ");
  function exportReport() {
    downloadCsv("sentinel-resumen.csv", [
      ["Indicador", "Valor", "Contexto"],
      ["Índice de riesgo", score, "Media de riesgo de activos · 0 a 100"],
      ["Alertas activas", active.length, "Abiertas + en investigación"],
      ["Alertas críticas activas", critical, "Pendientes de resolución"],
      ["Activos inventariados", assets.length, "Instantánea ficticia: 2026-10-01"],
      ["Activos monitorizados", monitored, "Agentes conectados"],
    ]);
    notify("Informe de la instantánea exportado.");
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EL CONTEXTO QUE NECESITAS. CUANDO LO NECESITAS.</p>
          <h1>
            Tu perímetro, de un vistazo<span>.</span>
          </h1>
          <p>Menos ruido. Más claridad para tu próxima decisión.</p>
        </div>
        <button className="button export-button" onClick={exportReport}>
          <Download size={16} />
          Exportar informe
        </button>
      </div>
      <div className="metrics-grid">
        <Metric
          label="Alertas activas"
          value={active.length}
          description={`${alerts.filter((a) => a.status === "investigating").length} en investigación`}
          icon={Bell}
        />
        <Metric
          label="Alertas críticas"
          value={critical.toString().padStart(2, "0")}
          description={critical ? "Requieren tu atención" : "Todo al día"}
          icon={ShieldAlert}
          tone="critical"
        />
        <Metric
          label="Activos inventariados"
          value={assets.length}
          description={`${exposed.length} con riesgo alto o crítico`}
          icon={Layers}
        />
        <Metric
          label="Cobertura de monitorización"
          value={`${assets.length ? Math.round((monitored / assets.length) * 100) : 0}%`}
          description={`${monitored} de ${assets.length} agentes conectados`}
          icon={Radar}
          tone="green"
        />
      </div>
      <div className="dashboard-middle">
        <section className="risk-panel">
          <div className="risk-panel-top">
            <div>
              <span className="eyebrow">POSTURA DE SEGURIDAD</span>
              <h2>Una visión clara del riesgo.</h2>
            </div>
            <span className="dark-tag">
              <span />
              Riesgo {severityLabels[riskLevel(score)].toLowerCase()}
            </span>
          </div>
          <div className="risk-content">
            <div className="risk-summary">
              <div className="risk-gauge" style={{ "--score": score } as React.CSSProperties}>
                <div>
                  <strong>
                    {score}
                    <small>/100</small>
                  </strong>
                  <span>ÍNDICE DE RIESGO</span>
                </div>
              </div>
              <p>
                Media del riesgo de tus activos.
                <br />
                <strong>Cuanto menor, mejor.</strong>
              </p>
            </div>
            <div className="trend">
              <div className="trend-top">
                <span>
                  <ArrowDownRight size={15} />
                  {history[0] - history.at(-1)!} puntos en el período
                </span>
                <div className="period-toggle" aria-label="Período del historial">
                  <button
                    className={period === "week" ? "selected" : ""}
                    aria-pressed={period === "week"}
                    onClick={() => setPeriod("week")}
                  >
                    7 días
                  </button>
                  <button
                    className={period === "month" ? "selected" : ""}
                    aria-pressed={period === "month"}
                    onClick={() => setPeriod("month")}
                  >
                    30 días
                  </button>
                </div>
              </div>
              <svg
                className="trend-chart"
                viewBox="0 0 610 210"
                role="img"
                aria-label={`Historial de muestra: riesgo de ${history[0]} a ${history.at(-1)} en ${period === "week" ? "7" : "30"} días`}
              >
                <defs>
                  <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a4e6b7" stopOpacity=".19" />
                    <stop offset="100%" stopColor="#a4e6b7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[50, 100, 150].map((y, i) => (
                  <g key={y}>
                    <line x1="40" y1={y} x2="580" y2={y} stroke="#ffffff16" strokeDasharray="3 5" />
                    <text x="4" y={y + 4} fill="#86a79b" fontSize="11">
                      {[80, 50, 20][i]}
                    </text>
                  </g>
                ))}
                <polygon points={`40,190 ${points} 580,190`} fill="url(#chart-fill)" />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#afeac4"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle
                  cx="580"
                  cy={185 - history.at(-1)! * 1.65}
                  r="5"
                  fill="#bbf7d0"
                  stroke="#315b4b"
                  strokeWidth="4"
                />
                <text x="40" y="208" fill="#9eb7ac" fontSize="11">
                  {period === "week" ? "25 sep." : "2 sep."}
                </text>
                <text x="310" y="208" fill="#9eb7ac" fontSize="11">
                  {period === "week" ? "28 sep." : "16 sep."}
                </text>
                <text x="551" y="208" fill="#9eb7ac" fontSize="11">
                  1 oct.
                </text>
              </svg>
              <p className="chart-note">Historial ilustrativo · No cambia al resolver alertas</p>
            </div>
          </div>
          <div className="risk-panel-foot">
            <ShieldCheck size={15} />
            <span>El primer paso para proteger es entender.</span>
            <Link href="/activos">
              Explorar activos
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <section className="severity-panel panel">
          <SectionTitle title="Lo que necesita atención" subtitle="Alertas activas por gravedad" />
          <div className="severity-total">
            <strong>{active.length}</strong>
            <span>alertas pendientes</span>
          </div>
          <div className="severity-stacked">
            {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
              <div
                key={s}
                className={`segment-${s}`}
                style={{ flex: active.filter((a) => a.severity === s).length }}
              />
            ))}
          </div>
          <div className="severity-breakdown">
            {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
              <Link href={`/alertas?gravedad=${s}`} key={s}>
                <span className={`legend-dot segment-${s}`} />
                <span>{severityLabels[s]}</span>
                <strong>
                  {active
                    .filter((a) => a.severity === s)
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <ChevronRight size={14} />
              </Link>
            ))}
          </div>
          <div className="severity-tip">
            <span className="tip-dot" />
            Empieza por las críticas. Cada minuto cuenta.
          </div>
        </section>
      </div>
      <section className="panel priority-panel">
        <SectionTitle
          title="Primero, lo importante"
          subtitle="Las alertas pendientes con mayor prioridad"
          action={
            <Link className="text-button" href="/alertas">
              Ver todas las alertas
              <ArrowUpRight size={16} />
            </Link>
          }
        />
        {active.length ? (
          <AlertTable
            alerts={active.slice(0, 4)}
            assets={assets}
            onOpen={(id) => setSelection({ kind: "alert", id })}
            compact
          />
        ) : (
          <div className="all-clear">
            <ShieldCheck size={24} />
            <h3>No hay alertas pendientes</h3>
            <p>Has completado la revisión de esta instantánea.</p>
          </div>
        )}
        <div className="table-foot">
          <span>
            Mostrando {Math.min(4, active.length)} de {active.length} alertas activas
          </span>
          <span className="muted">Ordenadas por gravedad</span>
        </div>
      </section>
      <section className="exposure-section">
        <SectionTitle
          title="Activos en el punto de mira"
          subtitle="Dónde concentrar tus esfuerzos de protección"
          action={
            <Link className="text-button" href="/activos?riesgo=alto">
              Ver inventario
              <ArrowUpRight size={16} />
            </Link>
          }
        />
        <div className="exposure-grid">
          {exposed.slice(0, 4).map((a) => (
            <button
              className="exposure-card"
              key={a.id}
              onClick={() => setSelection({ kind: "asset", id: a.id })}
            >
              <div className="exposure-card-top">
                <span className="asset-icon">
                  <Layers size={18} />
                </span>
                <SeverityBadge severity={riskLevel(a.risk)} />
              </div>
              <strong>{a.name}</strong>
              <span>
                {a.type}
                <span> · </span>
                {a.environment}
              </span>
              <div className="exposure-card-foot">
                <small>Índice de riesgo</small>
                <strong>
                  {a.risk}
                  <small>/100</small>
                </strong>
                <ArrowUpRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </section>
      <DetailPanel selection={selection} onSelect={setSelection} />
    </>
  );
}
