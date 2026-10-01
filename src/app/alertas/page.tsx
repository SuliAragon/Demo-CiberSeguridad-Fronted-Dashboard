import { AlertsView } from "@/components/alerts-view";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="page-note">Cargando alertas…</p>}>
      <AlertsView />
    </Suspense>
  );
}
