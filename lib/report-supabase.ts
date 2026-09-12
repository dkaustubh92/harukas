import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Report, ReportAction } from "./report-contract";
import { ReportError } from "./report-errors";

const TABLE = "harukas_reports";
const BUCKET = "harukas-report-photos";
const PROJECT_URL = "https://mgelmrwklixmhdhfxypk.supabase.co";
type Receipt = { input: string; report: Report };
type Row = {
  id: string; reference: string; client_submission_id: string; version: number;
  status: Report["status"]; priority: Report["effectivePriority"];
  created_at: string; updated_at: string; document: Report;
  action_receipts: Record<string, Receipt>;
};

function unavailable(): ReportError {
  return new ReportError(503, "report_storage_unavailable", "Report storage is unavailable. Retry with the same submission or action ID.");
}

function row(report: Report, receipts: Row["action_receipts"] = {}): Row {
  return {
    id: report.id, reference: report.reference, client_submission_id: report.clientSubmissionId,
    version: report.version, status: report.status, priority: report.effectivePriority,
    created_at: report.createdAt, updated_at: report.updatedAt, document: report,
    action_receipts: receipts,
  };
}

function receiptResult(record: Row, actionId: string, fingerprint: string) {
  if (!Object.prototype.hasOwnProperty.call(record.action_receipts, actionId)) return null;
  const prior = record.action_receipts[actionId];
  if (prior.input !== fingerprint)
    throw new ReportError(409, "action_id_conflict", "This action ID was already used for another update.");
  return { report: structuredClone(prior.report), duplicate: true };
}

// The injected client also allows the persistence protocol to be exercised
// without sending test reports to the shared demo project.
export function createReportPersistence(client: SupabaseClient) {
  let seedPromise: Promise<void> | undefined;

  async function find(column: "id" | "client_submission_id", value: string): Promise<Row | null> {
    if (column === "id" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return null;
    const { data, error } = await client.from(TABLE).select("*").eq(column, value).maybeSingle();
    if (error) throw unavailable();
    return data as Row | null;
  }

  async function required(id: string): Promise<Row> {
    const record = await find("id", id);
    if (!record) throw new ReportError(404, "report_not_found", "This demo report was not found.");
    return record;
  }

  return {
    async seed(reports: Report[]) {
      seedPromise ??= (async () => {
        const { error } = await client.from(TABLE).upsert(reports.map((report) => row(report)), {
          onConflict: "id", ignoreDuplicates: true,
        });
        if (error) throw unavailable();
      })().catch((error) => { seedPromise = undefined; throw error; });
      await seedPromise;
    },

    async read(id: string): Promise<Report> {
      return structuredClone((await required(id)).document);
    },

    async list(): Promise<Report[]> {
      const reports: Report[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await client.from(TABLE).select("document").order("id").range(offset, offset + 499);
        if (error) throw unavailable();
        reports.push(...data.map((record) => record.document as Report));
        if (data.length < 500) return reports;
      }
    },

    async create(input: Report, bytes: Uint8Array) {
      const prior = await find("client_submission_id", input.clientSubmissionId);
      if (prior) return { report: structuredClone(prior.document), duplicate: true };
      const { count, error: countError } = await client.from(TABLE).select("id", { count: "exact", head: true });
      if (countError) throw unavailable();
      if ((count ?? 0) >= 100)
        throw new ReportError(400, "demo_capacity", "This demo server has reached its report limit.");
      const report = structuredClone(input);
      report.reference = `DEMO-${report.id.toUpperCase()}`;
      const path = `${report.id}/photo.jpg`;
      report.photo.storagePath = path;
      const bucket = client.storage.from(BUCKET);
      const { error: uploadError } = await bucket.upload(path, bytes, { contentType: "image/jpeg", upsert: false });
      if (uploadError) throw unavailable();
      const { error } = await client.from(TABLE).insert(row(report));
      if (!error) return { report, duplicate: false };

      // A timeout may have happened after a successful insert. Resolve the
      // submission before removing bytes that a committed report could use.
      const winner = await find("client_submission_id", report.clientSubmissionId);
      if (winner?.id === report.id) return { report: winner.document, duplicate: false };
      await bucket.remove([path]);
      if (winner) return { report: winner.document, duplicate: true };
      throw unavailable();
    },

    async action(id: string, action: ReportAction, transition: (report: Report, action: ReportAction) => Report) {
      const fingerprint = JSON.stringify(action);
      const current = await required(id);
      const prior = receiptResult(current, action.actionId, fingerprint);
      if (prior) return prior;
      const report = transition(structuredClone(current.document), action);
      const receipts = { ...current.action_receipts, [action.actionId]: { input: fingerprint, report } };
      const { data, error } = await client.from(TABLE).update(row(report, receipts))
        .eq("id", id).eq("version", action.expectedVersion).select("document").maybeSingle();
      if (!error && data) return { report: data.document as Report, duplicate: false };
      const latest = await required(id);
      const landed = receiptResult(latest, action.actionId, fingerprint);
      if (landed) return landed;
      if (error) throw unavailable();
      throw new ReportError(409, "version_conflict", "This report changed. Refresh it before saving your decision.");
    },

    async photo(id: string): Promise<Uint8Array> {
      const report = (await required(id)).document;
      const path = `${id}/photo.jpg`;
      if (report.source !== "citizen" || report.photo.storagePath !== path)
        throw new ReportError(404, "photo_not_found", "Use the photo URL on this demo report.");
      const { data, error } = await client.storage.from(BUCKET).download(path);
      if (error || !data) throw unavailable();
      return new Uint8Array(await data.arrayBuffer());
    },
  };
}

let persistence: ReturnType<typeof createReportPersistence> | undefined;

export function getReportPersistence() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return null;
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
  if (url !== PROJECT_URL)
    throw new ReportError(503, "report_storage_configuration", "Report storage must use the configured HaruKas Supabase project.");
  persistence ??= createReportPersistence(createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }));
  return persistence;
}
