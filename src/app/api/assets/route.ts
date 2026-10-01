import { assets } from "@/lib/data";
export async function GET() {
  return Response.json({ data: assets }, { headers: { "Cache-Control": "no-store" } });
}
