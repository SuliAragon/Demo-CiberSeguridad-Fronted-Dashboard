"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Server,
  Monitor,
  Cloud,
  Network,
  ArrowUpRight,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldAlert,
  Radio,
} from "lucide-react";
import { useSecurity } from "./security-provider";
import { SearchField, EmptyState, Metric, SeverityBadge } from "./ui";
import { DetailPanel, type Selection } from "./details";
import { riskLevel } from "@/lib/security";
import { downloadCsv } from "@/lib/csv";
import type { Asset } from "@/lib/types";
const icons = { Servidor: Server, Endpoint: Monitor, Cloud, Red: Network };
export function AssetsView() {
  const { assets, alerts, notify } = useSecurity();
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [environment, setEnvironment] = useState("all");
  const [view, setView] = useState("table");
  const [sort, setSort] = useState("risk");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<Selection>(null);
  const riskParam = params.get("riesgo") ?? "all";
  const risk = ["alto", "critical", "medium", "low"].includes(riskParam) ? riskParam : "all";
  const filtered = assets
    .filter(
      (a) =>
        (type === "all" || a.type === type) &&
        (environment === "all" || a.environment === environment) &&
        (risk === "all" || (risk === "alto" ? a.risk >= 60 : riskLevel(a.risk) === risk)) &&
        `${a.name} ${a.ip} ${a.owner} ${a.tags.join(" ")}`
          .toLocaleLowerCase("es")
          .includes(query.toLocaleLowerCase("es").trim()),
    )
    .sort((a, b) => (sort === "risk" ? b.risk - a.risk : a.name.localeCompare(b.name)));
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * 8, current * 8);
  function clear() {
    setQuery("");
    setType("all");
    setEnvironment("all");
    setPage(1);
    router.replace("/activos", { scroll: false });
  }
  function exportRows() {
    downloadCsv("sentinel-activos.csv", [
      [
        "Activo",
        "Tipo",
        "Dirección / región",
        "Entorno",
        "Propietario",
        "Riesgo (0–100)",
        "Agente",
        "Vulnerabilidades",
      ],
      ...filtered.map((a) => [
        a.name,
        a.type,
        a.ip,
        a.environment,
        a.owner,
        a.risk,
        a.monitored ? "Conectado" : "Sin conexión",
        a.vulnerabilities,
      ]),
    ]);
    notify(`${filtered.length} activos exportados con los filtros actuales.`);
  }
  function alertCount(asset: Asset) {
    return alerts.filter((a) => a.assetId === asset.id && a.status !== "resolved").length;
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">NO PUEDES PROTEGER LO QUE NO CONOCES</p>
          <h1>
            Tu inventario de activos<span>.</span>
          </h1>
          <p>Visibilidad sobre cada pieza de tu infraestructura.</p>
        </div>
        <button className="button export-button" onClick={exportRows} disabled={!filtered.length}>
          <Download size={16} />
          Exportar CSV
        </button>
      </div>
      <div className="metrics-grid three-metrics">
        <Metric
          label="Activos totales"
          value={assets.length}
          description="En todos los entornos"
          icon={Layers}
        />
        <Metric
          label="Riesgo alto o crítico"
          value={assets.filter((a) => a.risk >= 60).length}
          description="Prioridad de revisión"
          icon={ShieldAlert}
          tone="critical"
        />
        <Metric
          label="Agentes sin conexión"
          value={assets.filter((a) => !a.monitored).length}
          description="Visibilidad limitada"
          icon={Radio}
        />
      </div>
      <section className="panel list-panel">
        <div className="inventory-toolbar">
          <div>
            <h2>Todos los activos</h2>
            <span className="count-chip">{filtered.length}</span>
          </div>
          <div className="view-toggle" aria-label="Formato del inventario">
            <button
              aria-label="Vista de tabla"
              aria-pressed={view === "table"}
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              <List size={18} />
            </button>
            <button
              aria-label="Vista de tarjetas"
              aria-pressed={view === "grid"}
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={17} />
            </button>
          </div>
        </div>
        <div className="filter-bar asset-filters">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, IP o propietario…"
          />
          <div className="filter-controls">
            <label>
              <span className="sr-only">Tipo de activo</span>
              <select
                aria-label="Tipo de activo"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Todos los tipos</option>
                {Object.keys(icons).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Entorno</span>
              <select
                aria-label="Entorno"
                value={environment}
                onChange={(e) => {
                  setEnvironment(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Todos los entornos</option>
                {["Producción", "Staging", "Corporativo"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Nivel de riesgo</span>
              <select
                aria-label="Nivel de riesgo"
                value={risk}
                onChange={(e) => {
                  router.replace(
                    e.target.value === "all" ? "/activos" : `/activos?riesgo=${e.target.value}`,
                    { scroll: false },
                  );
                  setPage(1);
                }}
              >
                <option value="all">Todos los riesgos</option>
                <option value="alto">Alto o crítico</option>
                <option value="critical">Crítico</option>
                <option value="medium">Medio</option>
                <option value="low">Bajo</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Ordenar activos</span>
              <select
                aria-label="Ordenar activos"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="risk">Mayor riesgo</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </label>
          </div>
        </div>
        {(query || type !== "all" || environment !== "all" || risk !== "all") && (
          <div className="active-filters">
            <span>{filtered.length} activos encontrados</span>
            <button onClick={clear}>Restablecer filtros</button>
          </div>
        )}
        {!visible.length ? (
          <EmptyState
            title="No hay activos con estos filtros"
            action={
              <button className="button" onClick={clear}>
                Restablecer filtros
              </button>
            }
          />
        ) : view === "table" ? (
          <div className="table-scroll">
            <table className="data-table asset-table">
              <caption className="sr-only">Inventario de activos y riesgo</caption>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Tipo / entorno</th>
                  <th>Propietario</th>
                  <th>Riesgo</th>
                  <th>Alertas activas</th>
                  <th>Agente</th>
                  <th>
                    <span className="sr-only">Detalle</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => {
                  const Icon = icons[a.type];
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="asset-title-cell">
                          <span className="asset-icon">
                            <Icon size={18} />
                          </span>
                          <button
                            className="row-title"
                            onClick={() => setSelection({ kind: "asset", id: a.id })}
                          >
                            <strong>{a.name}</strong>
                            <small className="mono">{a.ip}</small>
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="stacked-cell">
                          {a.type}
                          <small>{a.environment}</small>
                        </span>
                      </td>
                      <td>{a.owner}</td>
                      <td>
                        <div className="table-risk">
                          <strong>{a.risk}</strong>
                          <div className="risk-track">
                            <span
                              className={`risk-fill risk-${riskLevel(a.risk)}`}
                              style={{ width: `${a.risk}%` }}
                            />
                          </div>
                        </div>
                        <span className="risk-level-label">
                          {a.risk >= 80
                            ? "Crítico"
                            : a.risk >= 60
                              ? "Alto"
                              : a.risk >= 30
                                ? "Medio"
                                : "Bajo"}
                        </span>
                      </td>
                      <td>
                        <span className={alertCount(a) ? "alert-count" : "muted"}>
                          {alertCount(a)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`agent-state ${a.monitored ? "connected" : "disconnected"}`}
                        >
                          <span />
                          {a.monitored ? "Conectado" : "Sin conexión"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="row-open"
                          aria-label={`Abrir ${a.name}`}
                          onClick={() => setSelection({ kind: "asset", id: a.id })}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="asset-card-grid">
            {visible.map((a) => {
              const Icon = icons[a.type];
              return (
                <button
                  className="inventory-card"
                  key={a.id}
                  onClick={() => setSelection({ kind: "asset", id: a.id })}
                >
                  <div className="exposure-card-top">
                    <span className="asset-icon">
                      <Icon size={20} />
                    </span>
                    <SeverityBadge severity={riskLevel(a.risk)} />
                  </div>
                  <h3>{a.name}</h3>
                  <p className="mono">{a.ip}</p>
                  <div className="inventory-card-meta">
                    <span>{a.type}</span>
                    <span>{a.environment}</span>
                  </div>
                  <div className="inventory-card-bottom">
                    <span className={`agent-state ${a.monitored ? "connected" : "disconnected"}`}>
                      <span />
                      {a.monitored ? "Conectado" : "Sin conexión"}
                    </span>
                    <strong>
                      {a.risk}
                      <small>/100</small>
                    </strong>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div className="pagination">
          <span>
            {filtered.length
              ? `${(current - 1) * 8 + 1}–${Math.min(current * 8, filtered.length)}`
              : "0"}{" "}
            de {filtered.length} activos
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Página anterior"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Página {current} de {pages}
            </span>
            <button
              className="icon-button"
              aria-label="Página siguiente"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <p className="page-note">
        Riesgo: bajo 0–29 · medio 30–59 · alto 60–79 · crítico 80–100. Puntuaciones ilustrativas,
        sin escaneo real.
      </p>
      <DetailPanel selection={selection} onSelect={setSelection} />
    </>
  );
}
