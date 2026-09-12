import { listReports, reportErrorResponse, reportResponse, reportStoreMeta } from "@/lib/report-store";
import { createCitizenReport } from "@/lib/report-create";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return reportResponse(await listReports(new URL(request.url).searchParams));
  } catch (error) {
    return reportErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = await createCitizenReport(request);
    return reportResponse({ ...result, url: `/reports/${result.report.id}`, meta: reportStoreMeta() }, result.duplicate ? 200 : 201);
  } catch (error) {
    return reportErrorResponse(error);
  }
}
