import { publicReport, readReport, reportErrorResponse, reportResponse, reportStoreMeta } from "@/lib/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const report = await readReport(id);
    const staff = new URL(request.url).searchParams.get("view") === "staff";
    return reportResponse({ report: staff ? report : publicReport(report), meta: reportStoreMeta() });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
