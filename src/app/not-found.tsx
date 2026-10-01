import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Página no encontrada</h1>
      <p>Esta ruta no forma parte del espacio de trabajo.</p>
      <Link className="button primary" href="/">
        Volver al resumen
      </Link>
    </div>
  );
}
