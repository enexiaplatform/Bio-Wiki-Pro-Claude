import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import type { QualityLabProject } from "@shared/quality-lab";
import type { SpecialistKind } from "@shared/quality-lab-specialist-basis";
import {
  captureSpecialistBasis,
  twinSourceBasisHash,
} from "@shared/quality-lab-twin-specialists";
import {
  getQualityLabProject,
  saveQualityLabProject,
} from "@/lib/quality-lab-projects";

export function SpecialistBasisHandoff({
  project,
  kind,
  input,
  onRestore,
}: {
  project: QualityLabProject;
  kind: SpecialistKind;
  input: unknown;
  onRestore: (input: any) => void;
}) {
  const [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const currentInput = useRef(input);
  currentInput.current = input;
  useEffect(() => setConfirmed(false), [input]);
  async function apply(restore = false) {
    setBusy(true);
    setMessage("");
    try {
      const latest = getQualityLabProject(project.id);
      if (
        !latest ||
        (await twinSourceBasisHash(latest)) !==
          (await twinSourceBasisHash(project))
      )
        throw new Error(
          "The Blueprint changed. Reopen this analysis against its current basis.",
        );
      if (restore) {
        const record = latest.input.specialistBasis?.find(
          (item) => item.kind === kind,
        );
        if (
          !record ||
          record.input.projectId !== latest.id ||
          record.sourceBasisHash !== (await twinSourceBasisHash(latest))
        )
          throw new Error(
            "No accepted basis matches this Blueprint. Review the inputs below and save a new basis.",
          );
        onRestore(record.input);
        setConfirmed(false);
        setMessage(
          "Accepted planning assumptions restored. Review any edits before replacing the saved basis.",
        );
      } else {
        if (!confirmed) return;
        const record = await captureSpecialistBasis(latest, kind, input);
        if (currentInput.current !== input)
          throw new Error(
            "The analysis inputs changed. Review them again before saving.",
          );
        saveQualityLabProject(
          {
            ...latest.input,
            specialistBasis: [
              ...(latest.input.specialistBasis ?? []).filter(
                (item) => item.kind !== kind,
              ),
              record,
            ],
          },
          latest.id,
          latest.origin,
        );
        setConfirmed(false);
        setMessage(
          "Analysis basis saved in a new browser revision. It travels with explicit account saves and project exports.",
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The basis could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Decision Twin analysis basis"
      className="my-5 rounded-2xl border border-teal-300/20 bg-teal-300/[0.04] p-4"
    >
      <h2 className="font-bold">Connect this analysis to your Decision Twin</h2>
      <p className="mt-2 text-xs leading-6 text-slate-300">
        Review the inputs below. Saving accepts these as planning assumptions,
        including any illustrative defaults—not verified site evidence. The Twin
        will hold this operating basis fixed while testing demand changes.
      </p>
      <label className="mt-2 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={busy}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        I reviewed this analysis basis for scenario comparison.
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!confirmed || busy}
          onClick={() => void apply()}
          className="min-h-11 rounded-lg bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40"
        >
          Use this basis in the Twin
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void apply(true)}
          className="min-h-11 rounded-lg border border-white/20 px-4 py-3 text-sm"
        >
          Restore accepted basis
        </button>
        <Link
          href={`/quality-lab/projects/${project.id}#decision-twin`}
          className="min-h-11 px-3 py-3 text-sm text-teal-200 underline"
        >
          Return to Decision Twin
        </Link>
      </div>
      <p role="status" className="mt-2 text-sm text-teal-100">
        {busy ? "Checking and saving the model basis…" : message}
      </p>
    </section>
  );
}
