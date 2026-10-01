"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Layers,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Menu,
  X,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { useSecurity } from "./security-provider";
import { Dialog } from "./ui";
const navigation = [
  { href: "/", label: "Vista general", icon: LayoutDashboard },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/activos", label: "Inventario de activos", icon: Layers },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { alerts, loading, error, refresh, lastSync, reset } = useSecurity();
  const [mobileMenu, setMobileMenu] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (mobileMenu) sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [mobileMenu]);
  function closeMenu() {
    setMobileMenu(false);
    menuButtonRef.current?.focus();
  }
  const [guide, setGuide] = useState(false);
  const active = alerts.filter((a) => a.status !== "resolved").length;
  const current = navigation.find((n) => n.href === path)?.label ?? "Workspace";
  return (
    <>
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <aside
        ref={sidebarRef}
        className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}
        onKeyDown={(e) => {
          if (!mobileMenu) return;
          if (e.key === "Escape") {
            e.preventDefault();
            closeMenu();
          }
          if (e.key === "Tab") {
            const controls = [
              ...(sidebarRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []),
            ].filter((el) => el.getBoundingClientRect().width > 0);
            const first = controls[0],
              last = controls.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="brand-row">
          <Link href="/" className="brand" onClick={() => setMobileMenu(false)}>
            <div className="brand-icon">
              <ShieldCheck size={23} strokeWidth={1.7} />
            </div>
            <span>
              sentinel<span className="brand-period">.</span>
            </span>
          </Link>
          <button className="mobile-close icon-button" aria-label="Cerrar menú" onClick={closeMenu}>
            <X size={20} />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-avatar">A</span>
          <div>
            <strong>Acme Technologies</strong>
            <small>Security workspace</small>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Navegación principal">
          {navigation.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={path === n.href ? "page" : undefined}
              className={`nav-link ${path === n.href ? "active" : ""}`}
              onClick={() => setMobileMenu(false)}
            >
              <n.icon size={19} strokeWidth={1.7} />
              <span>{n.label}</span>
              {n.href === "/alertas" && active > 0 && <span className="nav-count">{active}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <div>
              <span className="live-dot" />
              <strong>Un entorno para explorar</strong>
            </div>
            <p>
              Datos de muestra.
              <br />
              Explora, investiga y prioriza.
            </p>
            <button
              onClick={() => {
                setGuide(true);
                setMobileMenu(false);
              }}
            >
              Descubre la demo
              <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className="help-link"
            onClick={() => {
              setGuide(true);
              setMobileMenu(false);
            }}
          >
            <HelpCircle size={18} />
            Ayuda y documentación
          </button>
          <div className="profile">
            <span className="profile-avatar">AS</span>
            <div>
              <strong>Analista de seguridad</strong>
              <small>Entorno de demostración</small>
            </div>
            <span className="profile-dot" />
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button className="mobile-scrim" aria-label="Cerrar navegación" onClick={closeMenu} />
      )}
      <div className="main-shell" inert={mobileMenu || undefined}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuButtonRef}
              className="icon-button menu-button"
              aria-label="Abrir menú"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <span className={`connection ${error ? "offline" : ""}`}>
              <span />
              {loading ? "Sincronizando" : error ? "Sin conexión" : "API conectada"}
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              disabled={loading}
              onClick={() => void refresh()}
              aria-label="Actualizar datos"
              title={
                lastSync
                  ? `Última sincronización: ${new Date(lastSync).toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" })}`
                  : "Actualizar datos"
              }
            >
              <RefreshCw size={17} className={loading ? "spinning" : ""} />
            </button>
            <Link
              href="/alertas"
              className="icon-button notification-button"
              aria-label={`Ver ${active} alertas activas`}
            >
              <Bell size={19} />
              {active > 0 && <span />}
            </Link>
            <span className="top-avatar" aria-hidden="true">
              AS
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="demo-banner">
            <Activity size={13} />
            <span>ENTORNO DEMO</span>
            <span className="demo-banner-text">Una instantánea de seguridad · 1 oct. 2026</span>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button className="button" onClick={() => void refresh()}>
                Reintentar
              </button>
            </div>
          )}
          {loading && !alerts.length ? (
            <div className="loading-state" aria-label="Cargando datos">
              <div className="skeleton skeleton-heading" />
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="skeleton" />
                ))}
              </div>
              <div className="skeleton skeleton-chart" />
            </div>
          ) : !error || alerts.length ? (
            children
          ) : null}
        </main>
        <footer className="app-footer">
          <span>
            <ShieldCheck size={13} />
            Sentinel Security Workspace
          </span>
          <span>Portfolio demo · Datos ficticios</span>
        </footer>
      </div>
      {guide && (
        <Dialog title="Tu primera vuelta por Sentinel" onClose={() => setGuide(false)} wide>
          <p className="dialog-intro">
            Un espacio para entender qué ocurre, dónde ocurre y qué hacer a continuación.
          </p>
          <ol className="guide-steps">
            <li>
              <strong>Empieza por el riesgo.</strong>
              <p>
                La vista general resume las alertas pendientes y los activos con mayor exposición.
                El índice es la media de sus puntuaciones, de 0 a 100.
              </p>
            </li>
            <li>
              <strong>Investiga una alerta.</strong>
              <p>
                Abre una fila, revisa las evidencias, asigna un responsable y cambia el estado. Tus
                cambios se guardan solo en este navegador.
              </p>
            </li>
            <li>
              <strong>Conoce el activo.</strong>
              <p>
                Consulta el inventario, filtra por entorno o riesgo y abre su ficha para ver las
                alertas relacionadas.
              </p>
            </li>
            <li>
              <strong>Llévate los datos.</strong>
              <p>
                Exporta a CSV las filas que estés viendo. Esta demo usa una API REST de muestra: no
                escanea sistemas ni ejecuta remediaciones.
              </p>
            </li>
          </ol>
          <div className="risk-legend">
            <strong>Escala de riesgo</strong>
            <p>0–29 bajo · 30–59 medio · 60–79 alto · 80–100 crítico</p>
          </div>
          <div className="dialog-actions">
            <button
              className="button"
              onClick={() => {
                reset();
                setGuide(false);
              }}
            >
              Restablecer demo
            </button>
            <button className="button primary" onClick={() => setGuide(false)}>
              Empezar a explorar
              <ArrowUpRight size={16} />
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
