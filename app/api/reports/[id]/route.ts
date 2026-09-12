import { publicReport, readReport, reportErrorResponse, reportResponse } from "@/lib/report-store";
import { DEMO_STORE_META } from "@/lib/report-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const report = readReport(id);
    const staff = new URL(request.url).searchParams.get("view") === "staff";
    return reportResponse({ report: staff ? report : publicReport(report), meta: DEMO_STORE_META });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
