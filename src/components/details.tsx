"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ShieldAlert,
  Server,
  User,
  Clock,
  ExternalLink,
  CircleCheck,
} from "lucide-react";
import { useSecurity } from "./security-provider";
import { Dialog, SeverityBadge, StatusBadge, formatDate } from "./ui";
import { analysts, type Alert, type AlertStatus, type Asset } from "@/lib/types";
import { riskLevel } from "@/lib/security";
export type Selection = { kind: "alert" | "asset"; id: string } | null;
export function DetailPanel({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (selection: Selection) => void;
}) {
  const { alerts, assets } = useSecurity();
  if (!selection) return null;
  if (selection.kind === "alert") {
    const alert = alerts.find((a) => a.id === selection.id);
    return alert ? (
      <AlertDetail
        key={alert.id}
        alert={alert}
        asset={assets.find((a) => a.id === alert.assetId)}
        onClose={() => onSelect(null)}
        onAsset={() => onSelect({ kind: "asset", id: alert.assetId })}
      />
    ) : null;
  }
  const asset = assets.find((a) => a.id === selection.id);
  return asset ? (
    <AssetDetail
      asset={asset}
      alerts={alerts.filter((a) => a.assetId === asset.id)}
      onClose={() => onSelect(null)}
      onAlert={(id) => onSelect({ kind: "alert", id })}
    />
  ) : null;
}
function AlertDetail({
  alert,
  asset,
  onClose,
  onAsset,
}: {
  alert: Alert;
  asset?: Asset;
  onClose: () => void;
  onAsset: () => void;
}) {
  const { updateAlert } = useSecurity();
  const [status, setStatus] = useState(alert.status);
  const [owner, setOwner] = useState(alert.owner);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const changed = status !== alert.status || owner !== alert.owner;
  async function save() {
    setSaving(true);
    setSaveError(false);
    const ok = await updateAlert(alert.id, { status, owner });
    setSaving(false);
    if (ok) onClose();
    else setSaveError(true);
  }
  return (
    <Dialog
      title={alert.title}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <div className="detail-badges">
        <SeverityBadge severity={alert.severity} />
        <StatusBadge status={alert.status} />
        <span className="mono">{alert.id}</span>
      </div>
      <p className="dialog-intro">{alert.description}</p>
      <div className="detail-meta">
        <div>
          <Clock size={16} />
          <span>
            Detección<strong>{formatDate(alert.detectedAt)}</strong>
          </span>
        </div>
        <div>
          <ShieldAlert size={16} />
          <span>
            Fuente<strong>{alert.source}</strong>
          </span>
        </div>
      </div>
      <button className="asset-link" onClick={onAsset}>
        <Server size={20} />
        <div>
          <small>ACTIVO AFECTADO</small>
          <strong>{asset?.name ?? alert.assetId}</strong>
        </div>
        <ExternalLink size={17} />
      </button>
      <section className="detail-section">
        <h3>Evidencias detectadas</h3>
        <ul className="evidence-list">
          {alert.evidence.map((item) => (
            <li key={item}>
              <span />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="recommendation">
        <div>
          <CircleCheck size={18} />
          <h3>Siguiente paso recomendado</h3>
        </div>
        <p>{alert.recommendation}</p>
      </section>
      <div className="form-grid">
        <label>
          Estado
          <select
            aria-label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value as AlertStatus)}
            disabled={saving}
          >
            <option value="open">Abierta</option>
            <option value="investigating">En investigación</option>
            <option value="resolved">Resuelta</option>
          </select>
        </label>
        <label>
          Responsable
          <select
            aria-label="Responsable"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            disabled={saving}
          >
            {analysts.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      {saveError && (
        <p role="alert" className="inline-error">
          No se han guardado los cambios. Puedes volver a intentarlo.
        </p>
      )}
      <p className="form-note">Los cambios de esta demo se guardan en tu navegador.</p>
      <div className="dialog-actions">
        <button className="button" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button
          className="button primary"
          disabled={saving || !changed}
          onClick={() => void save()}
        >
          <Check size={16} />
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </Dialog>
  );
}
function AssetDetail({
  asset,
  alerts,
  onClose,
  onAlert,
}: {
  asset: Asset;
  alerts: Alert[];
  onClose: () => void;
  onAlert: (id: string) => void;
}) {
  return (
    <Dialog title={asset.name} onClose={onClose}>
      <div className="detail-badges">
        <SeverityBadge severity={riskLevel(asset.risk)} />
        <span className="tag">{asset.type}</span>
        <span className="tag">{asset.environment}</span>
      </div>
      <div className="asset-risk">
        <span>Índice de riesgo</span>
        <strong>
          {asset.risk}
          <small>/100</small>
        </strong>
        <div className="risk-track">
          <span
            className={`risk-fill risk-${riskLevel(asset.risk)}`}
            style={{ width: `${asset.risk}%` }}
          />
        </div>
      </div>
      <dl className="asset-properties">
        <div>
          <dt>Dirección / región</dt>
          <dd className="mono">{asset.ip}</dd>
        </div>
        <div>
          <dt>Sistema</dt>
          <dd>{asset.os}</dd>
        </div>
        <div>
          <dt>Propietario</dt>
          <dd>
            <User size={14} />
            {asset.owner}
          </dd>
        </div>
        <div>
          <dt>Vulnerabilidades</dt>
          <dd>{asset.vulnerabilities} detectadas</dd>
        </div>
        <div>
          <dt>Monitorización</dt>
          <dd className={asset.monitored ? "text-green" : "text-amber"}>
            {asset.monitored ? "Agente conectado" : "Sin conexión"}
          </dd>
        </div>
        <div>
          <dt>Última telemetría</dt>
          <dd>{formatDate(asset.lastSeen)}</dd>
        </div>
      </dl>
      <div className="tags">
        {asset.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <section className="detail-section">
        <h3>
          Alertas relacionadas <span className="count-chip">{alerts.length}</span>
        </h3>
        {alerts.length ? (
          <div className="related-alerts">
            {alerts.map((a) => (
              <button key={a.id} onClick={() => onAlert(a.id)}>
                <div>
                  <SeverityBadge severity={a.severity} />
                  <strong>{a.title}</strong>
                  <StatusBadge status={a.status} />
                </div>
                <ArrowRight size={17} />
              </button>
            ))}
          </div>
        ) : (
          <p className="no-alerts">
            <CircleCheck size={18} />
            Este activo no tiene alertas en la instantánea.
          </p>
        )}
      </section>
      <div className="dialog-actions">
        <button className="button primary" onClick={onClose}>
          Cerrar ficha
        </button>
      </div>
    </Dialog>
  );
}
