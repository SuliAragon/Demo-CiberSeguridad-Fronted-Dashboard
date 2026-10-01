import { alerts } from "@/lib/data";
export async function GET() {
  return Response.json({ data: alerts }, { headers: { "Cache-Control": "no-store" } });
}
