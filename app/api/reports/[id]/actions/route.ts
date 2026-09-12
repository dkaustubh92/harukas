import { applyReportAction, reportErrorResponse, reportResponse, reportStoreMeta } from "@/lib/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await applyReportAction(id, await request.json());
    return reportResponse({ ...result, meta: reportStoreMeta() });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
