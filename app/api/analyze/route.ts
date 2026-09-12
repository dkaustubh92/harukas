import sharp from "sharp";
import { analyzeTreePhoto } from "@/lib/report-analysis";
import { ReportError, reportErrorResponse, reportResponse } from "@/lib/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new ReportError(400, "invalid_form", "Send the photo and report details as form data.");
    }
    const photo = form.get("photo");
    if (!(photo instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size === 0 || photo.size > 10 * 1024 * 1024)
      throw new ReportError(400, "invalid_photo", "Add one JPEG, PNG, or WebP photo no larger than 10 MB.");
    const locationLabel = form.get("location");
    const observations = form.get("observations");
    if (locationLabel !== null && typeof locationLabel !== "string") throw new ReportError(400, "invalid_input", "Location must be text.");
    if (observations !== null && typeof observations !== "string") throw new ReportError(400, "invalid_input", "Observations must be text.");
    let normalized;
    try {
      const decoder = sharp(Buffer.from(await photo.arrayBuffer()), { limitInputPixels: 25_000_000 });
      const metadata = await decoder.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) throw new Error("Unsupported image");
      normalized = await decoder.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer({ resolveWithObject: true });
    } catch {
      throw new ReportError(400, "invalid_photo", "This image could not be read. Choose a JPEG, PNG, or WebP photo.");
    }
    if (normalized.data.byteLength > 2 * 1024 * 1024)
      throw new ReportError(400, "invalid_photo", "Choose a smaller image. The normalized photo must be no larger than 2 MB.");
    return reportResponse(await analyzeTreePhoto({
      bytes: new Uint8Array(normalized.data),
      mediaType: "image/jpeg",
      locationLabel: typeof locationLabel === "string" ? locationLabel : "",
      observations: typeof observations === "string" ? observations : "",
    }));
  } catch (error) {
    return reportErrorResponse(error);
  }
}
