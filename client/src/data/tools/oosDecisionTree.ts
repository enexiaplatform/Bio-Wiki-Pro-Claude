// Static decision-logic for the OOS Investigation Decision Tree tool.
// A guided walk through the phased OOS approach (FDA OOS guidance). Educational
// only — follow your approved OOS SOP and QA disposition, not this tool.

export type NodeTone = "teal" | "amber" | "red";

export interface DecisionOption {
  label: string;
  next: string;
}

export interface DecisionNode {
  id: string;
  type: "question" | "outcome";
  /** Question prompt, or outcome heading. */
  text: string;
  /** Outcome detail / recommended action. */
  detail?: string;
  /** For questions. */
  options?: DecisionOption[];
  /** For outcomes. */
  tone?: NodeTone;
}

export const OOS_START = "start";

export const oosNodes: Record<string, DecisionNode> = {
  start: {
    id: "start",
    type: "question",
    text: "Is the out-of-specification result explained by a calculation or transcription error?",
    options: [
      { label: "Yes", next: "calc-error" },
      { label: "No", next: "phase1" },
    ],
  },
  "calc-error": {
    id: "calc-error",
    type: "outcome",
    tone: "teal",
    text: "Likely not a true OOS",
    detail: "Correct the calculation or transcription with documented justification and confirm with your supervisor. If the corrected result is within specification, a formal OOS investigation is not required — but keep the record of what happened.",
  },
  phase1: {
    id: "phase1",
    type: "question",
    text: "Phase I laboratory assessment: did you find an assignable laboratory cause (standards, system suitability, sample preparation, instrument, or technique)?",
    options: [
      { label: "Yes", next: "lab-cause" },
      { label: "No", next: "phase2" },
    ],
  },
  "lab-cause": {
    id: "lab-cause",
    type: "outcome",
    tone: "amber",
    text: "Invalidate with justification, then CAPA",
    detail: "Document the assignable cause and the objective evidence, invalidate the original result with QA approval, and drive a CAPA on the laboratory cause. Trend it — a recurring lab cause is a signal, not a one-off.",
  },
  phase2: {
    id: "phase2",
    type: "question",
    text: "No assignable laboratory cause was found, so the result is not invalidated. In the Phase II full-scale investigation, did the production/process review identify a root cause?",
    options: [
      { label: "Yes", next: "phase2-cause" },
      { label: "No", next: "phase2-nocause" },
    ],
  },
  "phase2-cause": {
    id: "phase2-cause",
    type: "outcome",
    tone: "amber",
    text: "Process root cause found",
    detail: "Assess product impact for this and any other affected batches. QA decides the batch disposition on the totality of evidence, and you drive a CAPA on the root cause.",
  },
  "phase2-nocause": {
    id: "phase2-nocause",
    type: "outcome",
    tone: "red",
    text: "Confirmed OOS — no assignable cause",
    detail: "With no assignable laboratory or process cause, the result stands as a confirmed OOS. QA decides the batch disposition (often reject or hold) on the totality of evidence. Do not test into compliance.",
  },
};
