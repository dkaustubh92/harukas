import { applyReportAction, reportErrorResponse, reportResponse } from "@/lib/report-store";
import { DEMO_STORE_META } from "@/lib/report-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = applyReportAction(id, await request.json());
    return reportResponse({ ...result, meta: DEMO_STORE_META });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
