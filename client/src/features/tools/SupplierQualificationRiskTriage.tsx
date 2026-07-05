import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { copyText } from "@/lib/clipboard";

interface RiskFactor {
  id: string;
  label: string;
  options: { value: number; label: string }[];
}

interface Control {
  id: string;
  label: string;
  action: string;
}

const FACTORS: RiskFactor[] = [
  {
    id: "criticality",
    label: "Material / service criticality",
    options: [
      { value: 1, label: "Indirect or non-contact" },
      { value: 2, label: "Excipient, secondary pack, or support service" },
      { value: 3, label: "API, primary pack, sterilization, or critical service" },
    ],
  },
  {
    id: "process-impact",
    label: "Process or product impact",
    options: [
      { value: 1, label: "No direct product impact" },
      { value: 2, label: "Could affect a quality attribute" },
      { value: 3, label: "Could affect sterility, safety, identity, or potency" },
    ],
  },
  {
    id: "supplier-history",
    label: "Supplier history",
    options: [
      { value: 1, label: "Established, strong history" },
      { value: 2, label: "Some findings or limited history" },
      { value: 3, label: "New supplier or prior quality issues" },
    ],
  },
  {
    id: "substitutability",
    label: "Substitutability",
    options: [
      { value: 1, label: "Many qualified sources" },
      { value: 2, label: "Few qualified sources" },
      { value: 3, label: "Sole source or difficult to replace" },
    ],
  },
  {
    id: "regulatory",
    label: "Regulatory / inspection status",
    options: [
      { value: 1, label: "Routinely inspected and registered where needed" },
      { value: 2, label: "Mixed or indirect evidence" },
      { value: 3, label: "Unknown, unregistered, or weak inspection evidence" },
    ],
  },
];

const CONTROLS: Control[] = [
  {
    id: "quality-agreement",
    label: "Signed quality agreement covers the qualified scope.",
    action: "Execute or update the quality agreement before routine supply.",
  },
  {
    id: "change-notification",
    label: "Change-notification clause requires advance notice for process, site, material, or sub-supplier changes.",
    action: "Add a clear prior-notification clause and define impact-assessment timelines.",
  },
  {
    id: "incoming-verification",
    label: "Incoming verification/testing is defined and justified for the material risk.",
    action: "Define incoming testing, CoA verification, reduced-testing criteria, and escalation rules.",
  },
  {
    id: "audit-plan",
    label: "Audit depth and requalification interval match supplier/material risk.",
    action: "Set on-site, remote, or questionnaire depth plus the next review/re-audit date.",
  },
  {
    id: "monitoring",
    label: "Ongoing monitoring trends deviations, OOS, complaints, delivery, and change notifications.",
    action: "Add supplier KPIs and periodic review triggers, not only initial approval.",
  },
];

const TONE = {
  red: "border-red-500/30 bg-red-500/10 text-red-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-100",
};

function recommendationFor(score: number, gaps: Control[]) {
  const hasCriticalGap = gaps.some((gap) => gap.id === "quality-agreement" || gap.id === "change-notification");
  if (score >= 12 || hasCriticalGap) {
    return {
      tone: "red" as const,
      label: "High-risk supplier - qualify deeply",
      depth:
        "On-site audit or strong remote justification, signed quality agreement, full incoming verification, annual review, and escalation plan for any change-notification breach.",
    };
  }
  if (score >= 8 || gaps.length > 1) {
    return {
      tone: "amber" as const,
      label: "Medium-risk supplier - strengthen controls",
      depth:
        "Documentation package plus remote audit or targeted questionnaire, quality agreement for GMP scope, justified incoming verification, and review about every 2 years.",
    };
  }
  return {
    tone: "teal" as const,
    label: "Low-risk supplier - documentation review may suffice",
    depth:
      "Questionnaire/document review, CoA or certificate verification as applicable, approved-supplier scope, and risk-based requalification about every 3 years.",
  };
}

function buildSupplierNote({
  supplierRef,
  materialScope,
  score,
  recommendation,
  gaps,
}: {
  supplierRef: string;
  materialScope: string;
  score: number;
  recommendation: ReturnType<typeof recommendationFor>;
  gaps: Control[];
}) {
  const gapText = gaps.length
    ? gaps.map((gap, index) => `${index + 1}. ${gap.label}\n   Action: ${gap.action}`).join("\n")
    : "None selected.";

  return [
    "# Supplier qualification risk triage note",
    "",
    `Supplier / site: ${supplierRef.trim() || "Not specified"}`,
    `Material / service scope: ${materialScope.trim() || "Not specified"}`,
    `Supplier risk score: ${score} / 15 - ${recommendation.label}`,
    "",
    "Recommended qualification depth:",
    recommendation.depth,
    "",
    "Control gaps to close:",
    gapText,
    "",
    "Minimum supplier package:",
    "- Supplier questionnaire / certification / GMP status evidence",
    "- Quality agreement with change notification and audit rights",
    "- Incoming verification or reduced-testing rationale",
    "- Approved-supplier-list scope and site/material coverage",
    "- Ongoing performance review and requalification interval",
  ].join("\n");
}

export function SupplierQualificationRiskTriage() {
  const [supplierRef, setSupplierRef] = useState("Supplier ABC - primary packaging site");
  const [materialScope, setMaterialScope] = useState("Primary container component");
  const [copied, setCopied] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    criticality: 3,
    "process-impact": 3,
    "supplier-history": 2,
    substitutability: 3,
    regulatory: 2,
  });
  const [controls, setControls] = useState<Record<string, boolean>>({
    "quality-agreement": false,
    "change-notification": false,
    "incoming-verification": true,
    "audit-plan": false,
    monitoring: false,
  });

  const assessment = useMemo(() => {
    const score = FACTORS.reduce((sum, factor) => sum + (scores[factor.id] ?? 1), 0);
    const gaps = CONTROLS.filter((control) => !controls[control.id]);
    return { score, gaps, recommendation: recommendationFor(score, gaps) };
  }, [scores, controls]);

  const supplierNote = useMemo(
    () =>
      buildSupplierNote({
        supplierRef,
        materialScope,
        score: assessment.score,
        recommendation: assessment.recommendation,
        gaps: assessment.gaps,
      }),
    [supplierRef, materialScope, assessment],
  );

  function reset() {
    setSupplierRef("Supplier ABC - primary packaging site");
    setMaterialScope("Primary container component");
    setScores({
      criticality: 3,
      "process-impact": 3,
      "supplier-history": 2,
      substitutability: 3,
      regulatory: 2,
    });
    setControls({
      "quality-agreement": false,
      "change-notification": false,
      "incoming-verification": true,
      "audit-plan": false,
      monitoring: false,
    });
  }

  async function copySupplierNote() {
    await copyText(supplierNote);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Supplier Qualification Risk Triage</h2>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Score supplier/material risk and identify the qualification depth: questionnaire,
        remote audit, on-site audit, quality agreement, incoming verification, and monitoring.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Supplier / site
              </span>
              <input
                value={supplierRef}
                onChange={(event) => setSupplierRef(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Material / service scope
              </span>
              <input
                value={materialScope}
                onChange={(event) => setMaterialScope(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {FACTORS.map((factor) => (
              <label key={factor.id}>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {factor.label}
                </span>
                <select
                  value={scores[factor.id]}
                  onChange={(event) => setScores((prev) => ({ ...prev, [factor.id]: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {factor.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Qualification controls</p>
            {CONTROLS.map((control) => {
              const checked = controls[control.id];
              return (
                <label key={control.id} className="block rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => setControls((prev) => ({ ...prev, [control.id]: event.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-background accent-primary"
                    />
                    <div>
                      <p className="text-sm">{control.label}</p>
                      {!checked && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Action: </span>
                          {control.action}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className={`rounded-2xl border p-5 ${TONE[assessment.recommendation.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              {assessment.recommendation.tone === "teal" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Supplier risk</p>
            </div>
            <div className="text-4xl font-bold mb-1">{assessment.score} / 15</div>
            <p className="text-sm font-semibold mb-2">{assessment.recommendation.label}</p>
            <p className="text-xs opacity-85 leading-relaxed">{assessment.recommendation.depth}</p>
          </div>

          {assessment.gaps.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-2.5">Control gaps</p>
              <ol className="space-y-2">
                {assessment.gaps.map((gap, index) => (
                  <li key={gap.id} className="text-xs flex gap-2">
                    <span className="font-bold text-amber-300 shrink-0">{index + 1}</span>
                    <span className="text-muted-foreground">{gap.action}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">Supplier package</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Questionnaire / certification / GMP status evidence</li>
              <li>Quality agreement with change notification and audit rights</li>
              <li>Incoming verification or reduced-testing rationale</li>
              <li>Approved-supplier-list scope and requalification interval</li>
            </ul>
            <button
              onClick={copySupplierNote}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-200 transition-colors hover:bg-teal-500/15"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy supplier note"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary/70" />
            Educational triage only. Your approved supplier-qualification SOP and QA decision remain the source of truth.
          </p>
        </aside>
      </div>
    </section>
  );
}
