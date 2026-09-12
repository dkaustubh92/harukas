import PublicReportView from "@/components/report/PublicReportView";

// Next 16 exposes dynamic route params as a Promise. Keep this page as the
// small server boundary and let the client component own the live status read.
export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PublicReportView reportId={id} />;
}
