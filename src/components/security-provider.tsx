"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Alert, AlertUpdate, Asset } from "@/lib/types";
import { parseAlertUpdate } from "@/lib/validation";
const STORAGE_KEY = "sentinel.alert-updates.v1";
interface SecurityContext {
  alerts: Alert[];
  assets: Asset[];
  loading: boolean;
  error: string | null;
  lastSync: string | null;
  refresh: () => Promise<void>;
  updateAlert: (id: string, update: AlertUpdate) => Promise<boolean>;
  reset: () => void;
  notify: (message: string) => void;
}
const Context = createContext<SecurityContext | null>(null);
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    signal: init?.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(10000)])
      : AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`API: ${response.status}`);
  const payload = await response.json();
  return payload.data as T;
}
function readUpdates(): Record<string, AlertUpdate> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).flatMap(([id, item]) => {
        const update = parseAlertUpdate(item);
        return update ? [[id, update]] : [];
      }),
    );
  } catch {
    return {};
  }
}
async function fetchSnapshot(signal?: AbortSignal) {
  const [alerts, assets] = await Promise.all([
    request<Alert[]>("/api/alerts", { signal }),
    request<Asset[]>("/api/assets", { signal }),
  ]);
  if (!Array.isArray(alerts) || !Array.isArray(assets)) throw new Error("Respuesta inválida");
  const updates = readUpdates();
  return { alerts: alerts.map((a) => ({ ...a, ...updates[a.id] })), assets };
}
export function SecurityProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const notify = useCallback((message: string) => setToast(message), []);
  const applySnapshot = useCallback((snapshot: Awaited<ReturnType<typeof fetchSnapshot>>) => {
    setAlerts(snapshot.alerts);
    setAssets(snapshot.assets);
    setLastSync(new Date().toISOString());
    setError(null);
    setLoading(false);
  }, []);
  const handleLoadError = useCallback(() => {
    setError("No se ha podido conectar con la API. Comprueba la conexión y vuelve a intentarlo.");
    setLoading(false);
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      applySnapshot(await fetchSnapshot());
    } catch {
      handleLoadError();
    }
  }, [applySnapshot, handleLoadError]);
  useEffect(() => {
    const controller = new AbortController();
    void fetchSnapshot(controller.signal)
      .then((snapshot) => {
        if (!controller.signal.aborted) applySnapshot(snapshot);
      })
      .catch(() => {
        if (!controller.signal.aborted) handleLoadError();
      });
    return () => controller.abort();
  }, [applySnapshot, handleLoadError]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function updateAlert(id: string, update: AlertUpdate) {
    try {
      const updated = await request<Alert>(`/api/alerts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      setAlerts((current) => current.map((a) => (a.id === id ? updated : a)));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readUpdates(), [id]: update }));
        notify("Alerta actualizada. Cambios guardados en este navegador.");
      } catch {
        notify("Alerta actualizada en esta sesión. El navegador no permite guardar los cambios.");
      }
      return true;
    } catch {
      notify("No se pudo guardar la alerta. Tus cambios no se han aplicado; vuelve a intentarlo.");
      return false;
    }
  }
  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      notify("El navegador no permite restablecer los datos guardados.");
      return;
    }
    void refresh();
    notify("La demo vuelve a su estado inicial.");
  }
  return (
    <Context.Provider
      value={{ alerts, assets, loading, error, lastSync, refresh, updateAlert, reset, notify }}
    >
      {children}
      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </Context.Provider>
  );
}
export function useSecurity() {
  const context = useContext(Context);
  if (!context) throw new Error("SecurityProvider is required");
  return context;
}
