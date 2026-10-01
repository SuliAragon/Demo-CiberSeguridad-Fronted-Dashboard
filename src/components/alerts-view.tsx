"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useSecurity } from "./security-provider";
import { SearchField, EmptyState } from "./ui";
import { AlertTable } from "./alert-table";
import { DetailPanel, type Selection } from "./details";
import { prioritizeAlerts } from "@/lib/security";
import { downloadCsv } from "@/lib/csv";
import { severityLabels, statusLabels, type Severity } from "@/lib/types";
const tabs = [
  { id: "active", label: "Activas" },
  { id: "open", label: "Abiertas" },
  { id: "investigating", label: "En investigación" },
  { id: "resolved", label: "Resueltas" },
  { id: "all", label: "Todas" },
];
export function AlertsView() {
  const { alerts, assets, notify } = useSecurity();
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("priority");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<Selection>(null);
  const severity = params.get("gravedad") ?? "all";
  const statusParam = params.get("estado") ?? "active";
  const status = tabs.some((t) => t.id === statusParam) ? statusParam : "active";
  const knownSeverity = Object.keys(severityLabels).includes(severity) ? severity : "all";
  const matchesStatus = (s: string, itemStatus: string) =>
    s === "all" || (s === "active" ? itemStatus !== "resolved" : itemStatus === s);
  const filtered = alerts.filter(
    (a) =>
      matchesStatus(status, a.status) &&
      (knownSeverity === "all" || a.severity === knownSeverity) &&
      `${a.id} ${a.title} ${a.source} ${a.owner} ${assets.find((asset) => asset.id === a.assetId)?.name}`
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es").trim()),
  );
  const sorted =
    sort === "priority"
      ? prioritizeAlerts(filtered)
      : [...filtered].sort((a, b) => Date.parse(b.detectedAt) - Date.parse(a.detectedAt));
  const pages = Math.max(1, Math.ceil(sorted.length / 6));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * 6, current * 6);
  function changeParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all" && key === "gravedad") next.delete(key);
    else next.set(key, value);
    router.replace(`/alertas?${next.toString()}`, { scroll: false });
    setPage(1);
  }
  function clear() {
    setQuery("");
    setPage(1);
    router.replace("/alertas", { scroll: false });
  }
  function exportRows() {
    downloadCsv("sentinel-alertas.csv", [
      ["ID", "Alerta", "Gravedad", "Activo", "Estado", "Responsable", "Detectada (UTC)"],
      ...sorted.map((a) => [
        a.id,
        a.title,
        severityLabels[a.severity],
        assets.find((asset) => asset.id === a.assetId)?.name,
        statusLabels[a.status],
        a.owner,
        a.detectedAt,
      ]),
    ]);
    notify(`${sorted.length} alertas exportadas con los filtros actuales.`);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DE LA SEÑAL A LA DECISIÓN</p>
          <h1>
            Alertas de seguridad<span>.</span>
          </h1>
          <p>Investiga, prioriza y da el siguiente paso con contexto.</p>
        </div>
        <button className="button export-button" onClick={exportRows} disabled={!sorted.length}>
          <Download size={16} />
          Exportar CSV
        </button>
      </div>
      <div className="alert-callout">
        <span className="callout-icon">
          <Bell size={21} />
        </span>
        <div>
          <strong>
            {alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length}{" "}
            alertas críticas pendientes
          </strong>
          <p>Revisa primero las señales con mayor impacto potencial.</p>
        </div>
        <button
          className="text-button"
          onClick={() => {
            setQuery("");
            setPage(1);
            router.replace("/alertas?gravedad=critical&estado=active", { scroll: false });
          }}
        >
          Revisar críticas
          <ChevronRight size={16} />
        </button>
      </div>
      <section className="panel list-panel">
        <div className="list-tabs" role="group" aria-label="Filtrar por estado">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeParam("estado", tab.id)}
              aria-pressed={status === tab.id}
              className={status === tab.id ? "active" : ""}
            >
              {tab.id === "resolved" && <CheckCheck size={16} />}
              {tab.label}
              <span>{alerts.filter((a) => matchesStatus(tab.id, a.status)).length}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <SearchField
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Buscar alerta, activo o responsable…"
          />
          <div className="filter-controls">
            <label>
              <span className="sr-only">Filtrar por gravedad</span>
              <select
                aria-label="Filtrar por gravedad"
                value={knownSeverity}
                onChange={(e) => changeParam("gravedad", e.target.value)}
              >
                <option value="all">Todas las gravedades</option>
                {Object.entries(severityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="sort-select">
              <ArrowDownWideNarrow size={15} />
              <span className="sr-only">Ordenar alertas</span>
              <select
                aria-label="Ordenar alertas"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="priority">Prioridad</option>
                <option value="recent">Más recientes</option>
              </select>
            </label>
          </div>
        </div>
        {(query || knownSeverity !== "all" || status !== "active") && (
          <div className="active-filters">
            <span>
              {sorted.length} resultados
              {knownSeverity !== "all" && (
                <> · Gravedad {severityLabels[knownSeverity as Severity].toLowerCase()}</>
              )}
            </span>
            <button onClick={clear}>Restablecer filtros</button>
          </div>
        )}
        {visible.length ? (
          <AlertTable
            alerts={visible}
            assets={assets}
            onOpen={(id) => setSelection({ kind: "alert", id })}
          />
        ) : (
          <EmptyState
            title={
              status === "resolved" && !query && knownSeverity === "all"
                ? "Aún no hay alertas resueltas"
                : "No hay alertas con estos filtros"
            }
            action={
              <button className="button" onClick={clear}>
                Restablecer filtros
              </button>
            }
          />
        )}
        <div className="pagination">
          <span>
            {sorted.length
              ? `${(current - 1) * 6 + 1}–${Math.min(current * 6, sorted.length)}`
              : "0"}{" "}
            de {sorted.length} alertas
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
        La gravedad describe el impacto potencial. El estado refleja el progreso de la
        investigación.
      </p>
      <DetailPanel selection={selection} onSelect={setSelection} />
    </>
  );
}
