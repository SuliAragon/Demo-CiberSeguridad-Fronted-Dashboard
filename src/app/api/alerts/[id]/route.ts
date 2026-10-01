import { alerts } from "@/lib/data";
import { parseAlertUpdate } from "@/lib/validation";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = alerts.find((item) => item.id === id);
  if (!alert) return Response.json({ error: "Alerta no encontrada" }, { status: 404 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "El cuerpo debe ser JSON válido" }, { status: 400 });
  }
  const update = parseAlertUpdate(body);
  if (!update) return Response.json({ error: "Estado o responsable no válido" }, { status: 400 });
  // API de demo sin persistencia de servidor. El cliente conserva el resultado en su navegador.
  return Response.json(
    { data: { ...alert, ...update } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
