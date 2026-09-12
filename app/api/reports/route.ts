import { listReports, reportErrorResponse, reportResponse } from "@/lib/report-store";
import { createCitizenReport } from "@/lib/report-create";
import { DEMO_STORE_META } from "@/lib/report-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  try {
    return reportResponse(listReports(new URL(request.url).searchParams));
  } catch (error) {
    return reportErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = await createCitizenReport(request);
    return reportResponse({ ...result, url: `/reports/${result.report.id}`, meta: DEMO_STORE_META }, result.duplicate ? 200 : 201);
  } catch (error) {
    return reportErrorResponse(error);
  }
}
