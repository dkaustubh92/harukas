import { reportErrorResponse, reportPhoto } from "@/lib/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const bytes = reportPhoto(id);
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": "image/jpeg", "Content-Length": String(bytes.byteLength),
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
