import { AssetsView } from "@/components/assets-view";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="page-note">Cargando inventario…</p>}>
      <AssetsView />
    </Suspense>
  );
}
