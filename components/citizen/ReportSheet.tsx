"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { GeographicMap } from "../GeographicMap";
import { AiDraftButton } from "./AiDraftButton";
import { Icon } from "./Icons";
import {
  REPRESENTATIVE_PHOTO_URL,
  type CitizenAnswer,
  type CitizenCategory,
  type CitizenCause,
  type CitizenDetails,
  type CitizenLocation,
  type CitizenObstruction,
  type CitizenReceipt,
  type CitizenTarget,
} from "./types";

interface ReportSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: (receipt: CitizenReceipt) => void;
  onSaveLocal: (input: {
    clientSubmissionId: string;
    location: CitizenLocation;
    citizenDetails: CitizenDetails;
    photoUrl: string;
  }) => CitizenReceipt;
}

type DraftStep = 1 | 2;

interface LocationChoice extends CitizenLocation {
  shortLabel: string;
}

const DEFAULT_LOCATION: LocationChoice = {
  latitude: 44.645,
  longitude: -63.575,
  label: "Downtown Halifax, NS",
  shortLabel: "Downtown Halifax",
  method: "pin",
};

const LOCATION_PRESETS: LocationChoice[] = [
  DEFAULT_LOCATION,
  {
    latitude: 44.646447,
    longitude: -63.59354,
    label: "Quinpool Road area, Halifax, NS",
    shortLabel: "Quinpool Road",
    method: "pin",
  },
  {
    latitude: 44.66917,
    longitude: -63.557754,
    label: "Portland Street area, Dartmouth, NS",
    shortLabel: "Portland Street",
    method: "pin",
  },
];

const CATEGORY_OPTIONS: Array<{ value: CitizenCategory; label: string }> = [
  { value: "tree_damage", label: "Tree damage" },
  { value: "access_obstruction", label: "Access obstruction" },
  { value: "utility_conflict", label: "Possible utility conflict" },
  { value: "other_unsure", label: "Other / unsure" },
];

const TARGET_OPTIONS: Array<{ value: CitizenTarget; label: string }> = [
  { value: "sidewalk", label: "Sidewalk" },
  { value: "road", label: "Road" },
  { value: "bus_stop", label: "Bus stop" },
  { value: "driveway", label: "Driveway" },
  { value: "other", label: "Other" },
];

const ANSWER_OPTIONS: Array<{ value: CitizenAnswer; label: string }> = [
  { value: "unknown", label: "Not sure" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const OBSTRUCTION_OPTIONS: Array<{ value: CitizenObstruction; label: string }> = [
  { value: "unknown", label: "Not sure" },
  { value: "none", label: "No obstruction" },
  { value: "partial", label: "Partly blocked" },
  { value: "full", label: "Fully blocked" },
];

const CAUSE_OPTIONS: Array<{ value: CitizenCause; label: string }> = [
  { value: "unknown", label: "Not sure" },
  { value: "storm", label: "Storm" },
  { value: "wind", label: "Wind" },
  { value: "ice", label: "Ice" },
  { value: "vehicle_impact", label: "Vehicle impact" },
  { value: "other", label: "Other" },
];

function createClientSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `citizen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function initialDetails(): CitizenDetails {
  return {
    title: "Tree incident near Downtown Halifax",
    category: "tree_damage",
    observations: "A tree or large branch may be damaged near the street.",
    targets: ["sidewalk"],
    damageAboveTarget: "unknown",
    obstruction: "unknown",
    cause: "unknown",
    utilityConcern: "unknown",
    immediateDanger: "unknown",
  };
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  return fallback;
}

async function representativeFile() {
  const response = await fetch(REPRESENTATIVE_PHOTO_URL, { cache: "force-cache" });
  if (!response.ok) throw new Error("The demo photo could not be loaded. Try choosing another image.");
  const blob = await response.blob();
  return new File([blob], "harukas-tree-demo.jpg", { type: blob.type || "image/jpeg" });
}

function formatCoordinates(location: CitizenLocation) {
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

export function ReportSheet({ open, onClose, onSaved, onSaveLocal }: ReportSheetProps) {
  const [step, setStep] = useState<DraftStep>(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(REPRESENTATIVE_PHOTO_URL);
  const [photoError, setPhotoError] = useState("");
  const [location, setLocation] = useState<LocationChoice>(DEFAULT_LOCATION);
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION.label);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [details, setDetails] = useState<CitizenDetails>(initialDetails);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [clientSubmissionId] = useState(createClientSubmissionId);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isSaving, onClose, open]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  if (!open) return null;

  const updateDetails = <K extends keyof CitizenDetails>(field: K, value: CitizenDetails[K]) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setAcknowledged(false);
    setSubmitError("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setPhotoError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setPhotoError("That image is over 10 MB. Choose a smaller photo.");
      return;
    }
    setPhotoError("");
    setPhotoFile(nextFile);
    setPhotoPreviewUrl(URL.createObjectURL(nextFile));
    setAcknowledged(false);
    setSubmitError("");
  };

  const chooseLocation = (choice: LocationChoice) => {
    setLocation(choice);
    setLocationLabel(choice.label);
    setLocationConfirmed(false);
    setLocationError("");
    setAcknowledged(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Current location is not available here. Choose a nearby place or move the pin manually.");
      return;
    }
    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation: LocationChoice = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current location",
          shortLabel: "Current location",
          method: "gps",
        };
        setLocation(currentLocation);
        setLocationLabel("Current location");
        setLocationConfirmed(false);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationError("We could not access your location. Your report is still possible—use the address or place a pin.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const continueToReview = () => {
    const errors: string[] = [];
    if (!photoPreviewUrl) {
      setPhotoError("Add one photo before continuing.");
      errors.push("photo");
    }
    if (!locationLabel.trim()) {
      setLocationError("Add an address or landmark, then confirm the tree location.");
      errors.push("location");
    }
    if (!locationConfirmed) {
      setLocationError("Confirm the tree location on the map before continuing.");
      errors.push("location");
    }
    if (errors.length) return;
    setStep(2);
    setSubmitError("");
  };

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acknowledged || !locationConfirmed || !photoPreviewUrl || isSaving) {
      setSubmitError("Review the details, confirm the tree pin, and acknowledge the review before submitting.");
      return;
    }
    setIsSaving(true);
    setSubmitError("");

    const submittedLocation: CitizenLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      label: locationLabel.trim(),
      method: location.method,
      confirmedAt: new Date().toISOString(),
    };
    const submittedDetails: CitizenDetails = {
      ...details,
      title: details.title.trim() || "Tree incident near Halifax",
      observations: details.observations.trim(),
      reviewedAt: new Date().toISOString(),
    };

    try {
      const file = photoFile ?? await representativeFile();
      const formData = new FormData();
      formData.append("photo", file);
      formData.append(
        "payload",
        JSON.stringify({
          clientSubmissionId,
          location: { ...submittedLocation, confirmed: true },
          citizenDetails: submittedDetails,
          reviewed: true,
        }),
      );

      const response = await fetch("/api/reports", { method: "POST", body: formData });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getErrorMessage(body, "The shared report could not be saved. Your draft is still here."));
      }

      const reportCandidate =
        typeof body === "object" && body !== null && "report" in body
          ? (body as { report?: unknown }).report
          : body;
      if (!reportCandidate || typeof reportCandidate !== "object") {
        throw new Error("The shared report returned an incomplete receipt. Your draft is still here.");
      }
      const responseBody = body as { report?: unknown; url?: string; duplicate?: boolean };
      const reportRecord = reportCandidate as Record<string, unknown>;
      const report = reportCandidate as unknown as CitizenReceipt["report"];
      const id = typeof reportRecord.id === "string" ? reportRecord.id : "";
      if (!id && !responseBody.url) {
        throw new Error("The shared report returned no report link. Your draft is still here.");
      }
      onSaved({
        mode: "server",
        report,
        url: responseBody.url || `/reports/${id}`,
        duplicate: responseBody.duplicate,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The shared report could not be saved. Your draft is still here.";
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveLocalCopy = () => {
    if (!acknowledged || !locationConfirmed) {
      setSubmitError("Review the details, confirm the tree pin, and acknowledge the review before saving a local demo copy.");
      return;
    }
    const submittedLocation: CitizenLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      label: locationLabel.trim(),
      method: location.method,
      confirmedAt: new Date().toISOString(),
    };
    const submittedDetails: CitizenDetails = {
      ...details,
      title: details.title.trim() || "Tree incident near Halifax",
      observations: details.observations.trim(),
      reviewedAt: new Date().toISOString(),
    };
    const receipt = onSaveLocal({
      clientSubmissionId,
      location: submittedLocation,
      citizenDetails: submittedDetails,
      photoUrl: photoPreviewUrl || REPRESENTATIVE_PHOTO_URL,
    });
    onSaved(receipt);
  };

  const title = step === 1 ? "Report a tree incident" : "Review your report";
  const canContinue = Boolean(photoPreviewUrl && locationConfirmed);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102c24]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation">
      <div className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-[#d7e0d8] bg-[#f8faf6] shadow-[0_24px_80px_rgba(16,44,36,0.28)] sm:max-h-[92dvh] sm:rounded-[1.75rem]" role="dialog" aria-modal="true" aria-labelledby="report-sheet-title">
        <div className="flex items-center justify-between border-b border-[#d7e0d8] bg-white/80 px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607568]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dce8d8] text-[#355c4c]">{step}</span>
              <span>Step {step} of 2</span>
            </div>
            <h2 id="report-sheet-title" className="truncate text-xl font-semibold tracking-[-0.025em] text-[#183e32]">{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d7e0d8] bg-white text-[#486b5c] transition hover:border-[#a9c0af] hover:bg-[#eef5ef] disabled:opacity-50" onClick={onClose} disabled={isSaving} aria-label="Close report form">
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
          {step === 1 ? (
            <div className="space-y-7">
              <section aria-labelledby="photo-heading">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#607568]">01 · Evidence</p>
                    <h3 id="photo-heading" className="mt-1 text-base font-semibold text-[#183e32]">Add one photo</h3>
                  </div>
                  <span className="rounded-full bg-[#eaf3e9] px-2.5 py-1 text-xs font-medium text-[#416953]">Required</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#d7e0d8] bg-[#dce9eb] sm:aspect-square">
                    <Image src={photoPreviewUrl} alt="Preview of the selected representative tree image" fill sizes="(min-width: 640px) 150px, 100vw" unoptimized className="object-cover" />
                    <span className="absolute bottom-2 left-2 rounded-full bg-[#183e32]/85 px-2 py-1 text-[10px] font-medium text-white">Demo image</span>
                  </div>
                  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-[#b9cabb] bg-[#f4f8f2] p-4">
                    <div>
                      <p className="text-sm font-medium text-[#2f5947]">A representative photo is ready</p>
                      <p className="mt-1 text-xs leading-5 text-[#607568]">For this demo, you can use the supplied image or choose a photo from your device. Stay back from damaged trees and wires.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input ref={fileInputRef} id="citizen-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoChange} />
                      <label htmlFor="citizen-photo" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#b9cabb] bg-white px-3.5 text-sm font-semibold text-[#2f5947] transition hover:border-[#6c9b7c] hover:bg-[#f8fbf7] focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[#6fa890]">
                        <Icon name="upload" size={17} />
                        Choose a photo
                      </label>
                      {photoFile && <span className="inline-flex min-h-11 items-center rounded-xl bg-[#dce8d8] px-3 text-xs font-medium text-[#355c4c]">{photoFile.name}</span>}
                    </div>
                  </div>
                </div>
                {photoError && <p className="mt-2 text-sm font-medium text-[#a83c2e]" role="alert">{photoError}</p>}
              </section>

              <section aria-labelledby="location-heading">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#607568]">02 · Location</p>
                    <h3 id="location-heading" className="mt-1 text-base font-semibold text-[#183e32]">Where is the tree?</h3>
                  </div>
                  <span className="rounded-full bg-[#eaf3e9] px-2.5 py-1 text-xs font-medium text-[#416953]">Required</span>
                </div>
                <div className="space-y-3">
                  <label htmlFor="tree-address" className="block text-sm font-medium text-[#355c4c]">Address or landmark</label>
                  <div className="relative">
                    <Icon name="map-pin" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#668575]" />
                    <input id="tree-address" value={locationLabel} onChange={(event) => { setLocationLabel(event.target.value); setLocationConfirmed(false); setLocationError(""); }} className="min-h-12 w-full rounded-xl border border-[#bccbbd] bg-white pl-11 pr-4 text-sm text-[#183e32] shadow-sm placeholder:text-[#8a9b8d] focus:border-[#56866c] focus:outline-none focus:ring-4 focus:ring-[#dce8d8]" placeholder="Street, park, or landmark" />
                  </div>
                  <div className="flex flex-wrap gap-2" aria-label="Suggested locations">
                    {LOCATION_PRESETS.map((preset) => (
                      <button key={preset.shortLabel} type="button" className={`min-h-10 rounded-full border px-3 text-xs font-medium transition ${locationLabel === preset.label ? "border-[#4d896d] bg-[#dce8d8] text-[#2f5947]" : "border-[#d7e0d8] bg-white text-[#607568] hover:border-[#9db9a4] hover:text-[#355c4c]"}`} onClick={() => chooseLocation(preset)}>{preset.shortLabel}</button>
                    ))}
                    <button type="button" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#d7e0d8] bg-white px-3 text-xs font-medium text-[#607568] transition hover:border-[#9db9a4] hover:text-[#355c4c]" onClick={useCurrentLocation} disabled={isLocating}>
                      <Icon name="location" size={14} />
                      {isLocating ? "Finding you…" : "Use current location"}
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#c8d9ca] bg-[#e3eee3]">
                    <GeographicMap className="h-64" points={[{ id: "tree-pin", latitude: location.latitude, longitude: location.longitude, title: "Tree location", priority: "routine" }]} selectedId="tree-pin" onLocationPick={(latitude, longitude) => {
                      setLocation(current => ({ ...current, latitude, longitude, method: "pin" }));
                      setLocationConfirmed(false);
                      setLocationError("");
                      setAcknowledged(false);
                    }} />
                    <p className="bg-white px-3 py-2 text-xs text-[#52645a]">Click the map to place the tree pin, then confirm its location. The address label does not move the pin.</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#c8d9ca] bg-[#f4f8f2] px-3.5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#355c4c]">{locationLabel || "Add a location"}</p>
                        <p className="mt-0.5 text-xs text-[#728779]">{formatCoordinates(location)}</p>
                      </div>
                      <button type="button" className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition ${locationConfirmed ? "bg-[#2f6a4e] text-white" : "border border-[#a9c0af] bg-white text-[#355c4c] hover:border-[#4d896d]"}`} onClick={() => { setLocationConfirmed((current) => !current); setLocationError(""); }} aria-pressed={locationConfirmed}>
                        {locationConfirmed ? <Icon name="check" size={17} /> : <Icon name="map-pin" size={17} />}
                        {locationConfirmed ? "Location confirmed" : "Confirm tree location"}
                      </button>
                    </div>
                  </div>
                </div>
                {locationError && <p className="mt-2 text-sm font-medium text-[#a83c2e]" role="alert">{locationError}</p>}
              </section>

              <div className="rounded-2xl border border-[#d7e0d8] bg-[#eef5ef] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#4d896d]"><Icon name="shield" size={17} /></span>
                  <div>
                    <p className="text-sm font-semibold text-[#355c4c]">Only share what is safe to observe</p>
                    <p className="mt-1 text-xs leading-5 text-[#607568]">You do not need to approach the tree. HaruKas is a demo and does not send a request to Halifax.</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={continueToReview} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#183e32] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(24,62,50,0.16)] transition hover:bg-[#255644] disabled:cursor-not-allowed disabled:opacity-45" disabled={!canContinue}>
                Continue to review <Icon name="arrow-right" size={18} />
              </button>
              {!canContinue && <p className="text-center text-xs text-[#728779]">Choose a photo and confirm the tree location to continue.</p>}
            </div>
          ) : (
            <form className="space-y-6" onSubmit={submitReport}>
              <AiDraftButton photo={photoFile} locationLabel={locationLabel} observations={details.observations} onDraft={draft => {
                setDetails(current => ({ ...current, title: draft.title, category: draft.category, observations: draft.observations, targets: draft.targets, damageAboveTarget: draft.damageAboveTarget, obstruction: draft.obstruction, utilityConcern: draft.utilityConcern }));
                setAcknowledged(false);
              }} />
              <div className="rounded-2xl border border-[#c8d9ca] bg-[#eef5ef] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#4d896d]"><Icon name="sparkle" size={18} /></span>
                  <div>
                    <p className="text-sm font-semibold text-[#2f5947]">Editable demo draft</p>
                    <p className="mt-1 text-xs leading-5 text-[#607568]">These starting details are intentionally cautious. Correct anything that does not match what you saw; unknown is a valid answer.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#355c4c]">Short title</span>
                  <input value={details.title} onChange={(event) => updateDetails("title", event.target.value)} className="min-h-12 w-full rounded-xl border border-[#bccbbd] bg-white px-4 text-sm text-[#183e32] shadow-sm focus:border-[#56866c] focus:outline-none focus:ring-4 focus:ring-[#dce8d8]" maxLength={120} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#355c4c]">What best describes it?</span>
                  <span className="relative block">
                    <select value={details.category} onChange={(event) => updateDetails("category", event.target.value as CitizenCategory)} className="min-h-12 w-full appearance-none rounded-xl border border-[#bccbbd] bg-white px-4 pr-10 text-sm text-[#183e32] shadow-sm focus:border-[#56866c] focus:outline-none focus:ring-4 focus:ring-[#dce8d8]">
                      {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <Icon name="chevron-down" size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#607568]" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#355c4c]">Recent cause, if known</span>
                  <span className="relative block">
                    <select value={details.cause} onChange={(event) => updateDetails("cause", event.target.value as CitizenCause)} className="min-h-12 w-full appearance-none rounded-xl border border-[#bccbbd] bg-white px-4 pr-10 text-sm text-[#183e32] shadow-sm focus:border-[#56866c] focus:outline-none focus:ring-4 focus:ring-[#dce8d8]">
                      {CAUSE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <Icon name="chevron-down" size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#607568]" />
                  </span>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#355c4c]">What did you notice?</span>
                  <textarea value={details.observations} onChange={(event) => updateDetails("observations", event.target.value)} className="min-h-24 w-full resize-y rounded-xl border border-[#bccbbd] bg-white px-4 py-3 text-sm leading-6 text-[#183e32] shadow-sm focus:border-[#56866c] focus:outline-none focus:ring-4 focus:ring-[#dce8d8]" maxLength={600} />
                  <span className="mt-1 block text-right text-xs text-[#839487]">{details.observations.length}/600</span>
                </label>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-[#355c4c]">What is nearby?</legend>
                <div className="flex flex-wrap gap-2">
                  {TARGET_OPTIONS.map((option) => {
                    const checked = details.targets.includes(option.value);
                    return <label key={option.value} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-sm transition ${checked ? "border-[#4d896d] bg-[#dce8d8] font-semibold text-[#2f5947]" : "border-[#d7e0d8] bg-white text-[#607568] hover:border-[#a9c0af]"}`}><input type="checkbox" className="sr-only" checked={checked} onChange={() => updateDetails("targets", checked ? details.targets.filter((target) => target !== option.value) : [...details.targets.filter((target) => target !== "unknown"), option.value])} /><span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-[#4d896d] bg-[#4d896d] text-white" : "border-[#9db3a1] bg-white"}`}>{checked && <Icon name="check" size={12} strokeWidth={2.5} />}</span>{option.label}</label>;
                  })}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Access blocked?" value={details.obstruction} options={OBSTRUCTION_OPTIONS} onChange={(value) => updateDetails("obstruction", value as CitizenObstruction)} />
                <SelectField label="Damaged part above a target?" value={details.damageAboveTarget} options={ANSWER_OPTIONS} onChange={(value) => updateDetails("damageAboveTarget", value as CitizenAnswer)} />
                <SelectField label="Possible wires or utility concern?" value={details.utilityConcern} options={ANSWER_OPTIONS} onChange={(value) => updateDetails("utilityConcern", value as CitizenAnswer)} />
                <SelectField label="Immediate danger?" value={details.immediateDanger} options={ANSWER_OPTIONS} onChange={(value) => updateDetails("immediateDanger", value as CitizenAnswer)} />
              </div>

              {(details.utilityConcern === "yes" || details.immediateDanger === "yes") && (
                <div className="rounded-2xl border border-[#e6b0a6] bg-[#fff2ef] p-4" role="alert">
                  <div className="flex items-start gap-3">
                    <Icon name="warning" size={19} className="mt-0.5 shrink-0 text-[#a83c2e]" />
                    <div>
                      <p className="text-sm font-semibold text-[#8f2f24]">Keep your distance</p>
                      <p className="mt-1 text-xs leading-5 text-[#8f5148]">If wires are down or there is immediate danger, stay at least 20 metres away and call 911. HaruKas does not make that call or notify anyone.</p>
                    </div>
                  </div>
                </div>
              )}

              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${acknowledged ? "border-[#4d896d] bg-[#eef5ef]" : "border-[#d7e0d8] bg-white hover:border-[#a9c0af]"}`}>
                <input type="checkbox" checked={acknowledged} onChange={(event) => { setAcknowledged(event.target.checked); setSubmitError(""); }} className="sr-only" />
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${acknowledged ? "border-[#4d896d] bg-[#4d896d] text-white" : "border-[#9db3a1] bg-white"}`}>{acknowledged && <Icon name="check" size={14} strokeWidth={2.5} />}</span>
                <span className="text-sm leading-5 text-[#355c4c]">I reviewed these details and understand this is a HaruKas demo report, not an official Halifax request.</span>
              </label>

              {submitError && <div className="rounded-2xl border border-[#e6b0a6] bg-[#fff2ef] p-4 text-sm leading-5 text-[#8f2f24]" role="alert"><p className="font-semibold">Shared save did not finish</p><p className="mt-1">{submitError}</p><button type="button" onClick={saveLocalCopy} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#c98276] bg-white px-3.5 text-sm font-semibold text-[#8f2f24] transition hover:bg-[#fffaf8]">Save a local demo copy <Icon name="arrow-right" size={16} /></button></div>}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => setStep(1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#bccbbd] bg-white px-4 text-sm font-semibold text-[#486b5c] transition hover:border-[#7da48a] hover:bg-[#f8fbf7]" disabled={isSaving}><Icon name="chevron-left" size={17} /> Back to location</button>
                <button type="submit" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#183e32] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(24,62,50,0.16)] transition hover:bg-[#255644] disabled:cursor-not-allowed disabled:opacity-45" disabled={!acknowledged || isSaving}>{isSaving ? "Saving demo report…" : "Review & submit demo report"}{!isSaving && <Icon name="arrow-right" size={18} />}</button>
              </div>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-[#728779]"><Icon name="shield" size={14} /> No contact details collected · Not sent to Halifax</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#355c4c]">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full appearance-none rounded-xl border border-[#bccbbd] bg-white px-4 pr-10 text-sm text-[#183e32] shadow-sm focus:border-[#56866c] focus:outline-none focus:ring-4 focus:ring-[#dce8d8]">
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <Icon name="chevron-down" size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#607568]" />
      </span>
    </label>
  );
}
