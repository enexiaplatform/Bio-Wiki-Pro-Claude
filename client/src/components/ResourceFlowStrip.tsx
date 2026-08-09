import { Link } from "wouter";
import type { IconType } from "react-icons";
import {
  PiArrowRight,
  PiBookOpenText,
  PiBooks,
  PiCheckCircle,
  PiClipboardText,
  PiFactory,
  PiFlowArrow,
  PiMagnifyingGlass,
  PiPulse,
  PiShieldCheck,
  PiToolbox,
  PiWrench,
} from "react-icons/pi";

export type ResourceFlowArea = "methods" | "monitor" | "academy" | "tools" | "toolkits" | "compliance";

interface FlowStep {
  title: string;
  description: string;
  icon: IconType;
}

const FLOWS: Record<ResourceFlowArea, { eyebrow: string; steps: [FlowStep, FlowStep, FlowStep] }> = {
  methods: {
    eyebrow: "Navigate evidence with boundaries",
    steps: [
      { title: "Define the need", description: "Method, standard, matrix, and decision context", icon: PiMagnifyingGlass },
      { title: "Check coverage", description: "See the sources Atlas does and does not cover", icon: PiBooks },
      { title: "Apply locally", description: "Confirm applicability before using the evidence", icon: PiShieldCheck },
    ],
  },
  monitor: {
    eyebrow: "Turn updates into reviewable impact",
    steps: [
      { title: "Watch official sources", description: "Focused FDA and EMA publication feeds", icon: PiPulse },
      { title: "Triage the signal", description: "Map topics to possible quality-system impact", icon: PiFlowArrow },
      { title: "Review applicability", description: "Human review before any change decision", icon: PiCheckCircle },
    ],
  },
  academy: {
    eyebrow: "Learn in the order work happens",
    steps: [
      { title: "Choose a path", description: "Start from your role, system, or current gap", icon: PiBookOpenText },
      { title: "Build the concept", description: "Use concise, evidence-backed lessons", icon: PiBooks },
      { title: "Apply in context", description: "Continue into the connected workflow or tool", icon: PiFlowArrow },
    ],
  },
  tools: {
    eyebrow: "Move from task to usable result",
    steps: [
      { title: "Start from the task", description: "Choose the decision or calculation in front of you", icon: PiMagnifyingGlass },
      { title: "Run the model", description: "Enter focused inputs with visible assumptions", icon: PiWrench },
      { title: "Use the result", description: "Carry the output into the related workflow", icon: PiFlowArrow },
    ],
  },
  toolkits: {
    eyebrow: "Use working files where they belong",
    steps: [
      { title: "Select the stage", description: "Anchor the file to a real process or QMS step", icon: PiFactory },
      { title: "Open the asset", description: "Checklist, template, guide, or working pack", icon: PiToolbox },
      { title: "Retain the evidence", description: "Complete local review, approval, and record control", icon: PiClipboardText },
    ],
  },
  compliance: {
    eyebrow: "Prepare from question to evidence",
    steps: [
      { title: "Choose a theme", description: "Start with the inspection concern or GMP area", icon: PiMagnifyingGlass },
      { title: "Rehearse the answer", description: "Use concise prompts and defensible reasoning", icon: PiClipboardText },
      { title: "Check the evidence", description: "Verify the record, trend, and decision trail", icon: PiShieldCheck },
    ],
  },
};

export function ResourceFlowStrip({ area }: { area: ResourceFlowArea }) {
  const flow = FLOWS[area];

  return (
    <section className="mb-7 overflow-hidden rounded-xl border border-white/[0.09] bg-[#08172a]/70" aria-label={`${flow.eyebrow} flow`}>
      <div className="flex flex-col gap-2 border-b border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">{flow.eyebrow}</p>
        <Link href="/workflows" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-teal-200">
          View connected systems <PiArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
        {flow.steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="contents">
              <div className="flex min-w-0 items-start gap-3 px-4 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-300/25 bg-teal-300/[0.07] text-teal-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-100">{index + 1}. {step.title}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-slate-400">{step.description}</span>
                </span>
              </div>
              {index < flow.steps.length - 1 && (
                <div className="hidden items-center text-teal-300/50 sm:flex" aria-hidden="true">
                  <span className="h-px w-4 bg-teal-300/30" />
                  <PiArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
