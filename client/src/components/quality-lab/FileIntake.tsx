import { useEffect, useRef, useState } from "react";
import {
  parseQualityLabCsv,
  type QualityLabCsvCell,
} from "@shared/quality-lab-csv";
import {
  candidatesFromMappings,
  confirmIntakeCandidate,
  extractCsvCandidates,
  INTAKE_FIELDS,
} from "@shared/quality-lab-intake";
import {
  type IntakeCandidate,
  type IntakeConfirmation,
  type IntakeSource,
} from "@shared/quality-lab-intake-contract";
import { type QualityLabInput } from "@shared/quality-lab";
import { useUser } from "@/context/UserContext";
import { recordQualityLabFunnelEvent } from "@/lib/quality-lab-funnel";

const valueText = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value);

export function IntakeProvenance({ input }: { input: QualityLabInput }) {
  if (!input.intakeProvenance?.length) return null;
  return (
    <details className="my-5 rounded-2xl border border-teal-300/20 bg-white/[0.03] p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Imported input sources · {input.intakeProvenance.length} confirmations
      </summary>
      <p className="mt-3 text-xs leading-6 text-slate-400">
        These are user-confirmed transcriptions, not verified regulatory
        evidence. Later input edits are identified below. Source context is
        saved with the project and included in explicit account copies and
        exports.
      </p>
      <ul className="mt-3 space-y-3">
        {input.intakeProvenance.map((record, index) => (
          <li
            key={`${record.field}-${index}`}
            className="break-words rounded-xl border border-white/10 p-3 text-xs leading-6"
          >
            <strong>
              {INTAKE_FIELDS[record.field]}: {valueText(input[record.field])}
            </strong>
            <p>
              {JSON.stringify(input[record.field]) ===
              JSON.stringify(record.value)
                ? "Matches confirmed import"
                : `Edited since import · confirmed value was ${valueText(record.value)}`}
            </p>
            <p>
              {record.source.fileName} → {record.source.section} →{" "}
              {record.source.locator}
            </p>
            <p>Source text: {record.source.text}</p>
            <p>Context: {record.source.context}</p>
            <p>
              {record.source.method} · {record.source.confidence} · confirmed{" "}
              {record.confirmedAt}
            </p>
            <details>
              <summary className="cursor-pointer">File fingerprint</summary>
              <p className="break-all">SHA-256 {record.source.fileSha256}</p>
            </details>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function FileIntake({
  onApply,
}: {
  onApply: (records: IntakeConfirmation[]) => void;
}) {
  const { isAuthenticated } = useUser();
  const [file, setFile] = useState<Pick<
    IntakeSource,
    "fileName" | "fileSha256"
  > | null>(null);
  const [cells, setCells] = useState<QualityLabCsvCell[]>([]);
  const [candidates, setCandidates] = useState<IntakeCandidate[]>([]);
  const [confirmed, setConfirmed] = useState<
    Record<string, IntakeConfirmation>
  >({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [aiReady, setAiReady] = useState(false);
  const [consent, setConsent] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/quality-lab/intake-capabilities", {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((result) => setAiReady(result?.aiAvailable === true))
      .catch(() => {});
    return () => {
      controller.abort();
      generation.current++;
    };
  }, []);
  async function loadFile(selected: File) {
    const revision = ++generation.current;
    setBusy(true);
    setMessage("");
    setConfirmed({});
    setCandidates([]);
    setCells([]);
    setFile(null);
    setConsent(false);
    try {
      if (
        !/\.csv$/i.test(selected.name) ||
        selected.size > 256000 ||
        selected.name.length > 180
      )
        throw new Error(
          "Choose a CSV file up to 256 KB with a filename under 180 characters.",
        );
      const buffer = await selected.arrayBuffer();
      let text: string;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      } catch {
        throw new Error("Export the spreadsheet as UTF-8 CSV and try again.");
      }
      const parsed = parseQualityLabCsv(text);
      if (!parsed.cells.length)
        throw new Error(
          "This CSV is empty. Add project field/value rows first.",
        );
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      const source = {
        fileName: selected.name,
        fileSha256: Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join(""),
      };
      const proposed = extractCsvCandidates(parsed.cells, source);
      if (revision !== generation.current) return;
      setCells(parsed.cells);
      setFile(source);
      setCandidates(proposed);
      setMessage(
        proposed.length
          ? "Review each candidate. No model inputs have changed."
          : "No supported values were matched. Use field/value rows, try optional AI assistance, or enter the facts in the planner.",
      );
      recordQualityLabFunnelEvent({
        stage: "intake_file_selected",
        source: "csv",
      });
      if (proposed.length)
        recordQualityLabFunnelEvent({
          stage: "intake_candidates_generated",
          source: "csv",
        });
    } catch (error) {
      if (revision === generation.current)
        setMessage(
          error instanceof Error ? error.message : "The CSV could not be read.",
        );
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  }
  async function assist() {
    if (!file || !consent || !isAuthenticated || !aiReady) return;
    const revision = generation.current;
    setBusy(true);
    setMessage(
      "Looking for candidate fields. Existing confirmations stay unchanged.",
    );
    try {
      const response = await fetch("/api/quality-lab/intake-assistance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          cells: cells.map(({ locator, text }) => ({ locator, text })),
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Sign in to use optional AI assistance."
            : "AI assistance is unavailable for this file. Local candidates and manual entry remain available.",
        );
      const result = await response.json();
      if (
        !Array.isArray(result.mappings) ||
        result.mappings.length > 20 ||
        result.mappings.some(
          (m: unknown) =>
            !m ||
            typeof m !== "object" ||
            !("field" in m) ||
            !("locator" in m) ||
            typeof m.field !== "string" ||
            typeof m.locator !== "string",
        )
      )
        throw new Error(
          "AI returned an unsupported result. Existing candidates were preserved.",
        );
      const proposed = candidatesFromMappings(
        cells,
        result.mappings,
        file,
        "ai-csv-field-map/v1",
      );
      if (revision !== generation.current) return;
      setCandidates((current) => [
        ...current,
        ...proposed.filter((next) => !current.some((c) => c.id === next.id)),
      ]);
      setMessage(
        proposed.length
          ? "AI suggestions need the same source review and explicit confirmation."
          : "AI found no additional supported values. No inputs changed.",
      );
      if (proposed.length)
        recordQualityLabFunnelEvent({
          stage: "intake_candidates_generated",
          source: "ai-csv",
        });
    } catch (error) {
      if (revision === generation.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Assistance failed; local review is still available.",
        );
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  }
  const count = Object.keys(confirmed).length;
  return (
    <section
      aria-labelledby="file-intake-heading"
      className="mt-6 rounded-2xl border border-teal-300/25 bg-slate-950/40 p-5"
    >
      <h2 id="file-intake-heading" className="text-xl font-bold">
        Already have project files?
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Upload a CSV and review the project facts Atlas finds. Your file stays
        in this browser unless you explicitly request AI assistance.
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-400">
        First release: UTF-8 comma CSV, up to 256 KB. Use two columns such as
        “Finished batches per month,36”, or one header row and one value row.
        Export the relevant sheet from Excel. Formulas, inferred totals, PDF and
        DOCX extraction are not supported here.
      </p>
      <label className="mt-4 block text-sm font-semibold">
        Project CSV
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            event.currentTarget.value = "";
            if (selected) void loadFile(selected);
          }}
          className="mt-2 block w-full min-w-0 rounded-xl border border-white/20 p-3 text-xs file:mr-3 file:rounded file:border-0 file:bg-teal-300 file:px-3 file:py-2 file:text-slate-950"
        />
      </label>
      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-sm leading-6 text-teal-100"
      >
        {busy ? "Working… " : ""}
        {message}
      </p>
      {file && (
        <>
          <p className="mt-3 break-words text-xs text-slate-400">
            {file.fileName} · {count} confirmed ·{" "}
            {candidates.filter((c) => !confirmed[c.id]).length} unconfirmed
            candidates
          </p>
          <div className="mt-3 space-y-3">
            {candidates.map((candidate) => (
              <article
                key={candidate.id}
                className="break-words rounded-xl border border-white/15 p-4"
              >
                <h3 className="font-semibold">
                  {INTAKE_FIELDS[candidate.field]}: {valueText(candidate.value)}
                </h3>
                <p className="mt-1 text-xs leading-6 text-slate-300">
                  {file.fileName} → CSV → {candidate.source.locator} ·{" "}
                  {candidate.source.confidence === "label-match"
                    ? "Exact label match; accuracy unverified"
                    : "AI suggestion; accuracy unverified"}
                </p>
                <details className="mt-2 text-xs leading-6 text-slate-400">
                  <summary className="cursor-pointer">
                    Inspect source context
                  </summary>
                  <p>Cell text: {candidate.source.text}</p>
                  <p>{candidate.source.context}</p>
                  <p>Extraction: {candidate.source.method}</p>
                </details>
                <label className="mt-2 flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    disabled={busy}
                    checked={Boolean(confirmed[candidate.id])}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setConfirmed((current) => {
                        const next = Object.fromEntries(
                          Object.entries(current).filter(
                            ([id, r]) =>
                              id !== candidate.id &&
                              (!checked || r.field !== candidate.field),
                          ),
                        );
                        if (checked)
                          next[candidate.id] =
                            confirmIntakeCandidate(candidate);
                        return next;
                      });
                      if (checked)
                        recordQualityLabFunnelEvent({
                          stage: "intake_candidate_confirmed",
                          source: "csv",
                        });
                    }}
                  />
                  Confirm {INTAKE_FIELDS[candidate.field]} from{" "}
                  {candidate.source.locator}
                </label>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Choose one source per field. Unchecked values are not applied.
          </p>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer">
              Missing or unconfirmed inputs
            </summary>
            <ul className="mt-2 list-inside list-disc text-xs leading-6 text-slate-400">
              {Object.entries(INTAKE_FIELDS)
                .filter(
                  ([field]) =>
                    !Object.values(confirmed).some((r) => r.field === field),
                )
                .map(([field, label]) => (
                  <li key={field}>
                    {label} —{" "}
                    {candidates.some((c) => c.field === field)
                      ? "not confirmed"
                      : "not found"}
                  </li>
                ))}
              <li>
                Current installed equipment capacity — enter and review
                separately
              </li>
              <li>
                Method suitability evidence — not established by this import
              </li>
            </ul>
          </details>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer">
              Optional AI assistance for unfamiliar labels
            </summary>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              AI maps source cells to supported input fields. It cannot approve
              values, calculate missing totals or establish regulatory
              applicability. This requires sign-in and an operator-configured
              service.
            </p>
            {!aiReady && (
              <p className="mt-2 text-xs text-amber-200">
                AI assistance is not configured. Local review works without it.
              </p>
            )}
            <label className="mt-3 flex min-h-11 items-start gap-3 text-xs leading-6">
              <input
                type="checkbox"
                disabled={!aiReady || !isAuthenticated || busy}
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              I authorize sending this CSV’s cell text to OpenAI for candidate
              mapping. I have permission to share this project information.
            </label>
            <button
              type="button"
              disabled={!aiReady || !isAuthenticated || !consent || busy}
              onClick={() => void assist()}
              className="mt-2 min-h-11 rounded-xl border border-white/25 px-4 disabled:opacity-40"
            >
              Suggest additional candidates
            </button>
          </details>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            Applying stores confirmed source text and locators with your working
            inputs when you save a Blueprint. These sources also travel with
            explicit account saves and exports. Unconfirmed candidates and the
            full CSV are not saved.
          </p>
          <button
            type="button"
            disabled={!count || busy}
            onClick={() => onApply(Object.values(confirmed))}
            className="mt-3 min-h-11 rounded-xl bg-teal-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-40"
          >
            Use {count} confirmed values in planner
          </button>
        </>
      )}
    </section>
  );
}
