import PDFDocument from "pdfkit";
import {
  buildCareerAnalysis,
  careerProfileFilename,
  type CareerAnalysis,
  type CareerProfile,
} from "../shared/career-blueprint.js";

const NAVY = "#071426";
const NAVY_LIGHT = "#10243a";
const TEAL = "#14b8a6";
const TEAL_LIGHT = "#5eead4";
const GOLD = "#e7b84b";
const INK = "#172033";
const MUTED = "#637083";
const PAPER = "#f7fafc";

interface BlueprintPage {
  title: string;
  eyebrow: string;
  intro?: string;
  visual?: "readiness" | "routes" | "milestones" | "worksheet" | "table";
  table?: { headers: string[]; widths: number[]; rows: string[][] };
  sections: Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }>;
}

function sentenceCase(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function pdfText(value: string) {
  return value.replace(/[–—−]/g, "-").replace(/→/g, "to").replace(/•/g, "/");
}

function readinessInterpretation(analysis: CareerAnalysis, key: string) {
  const item = analysis.competencies.find((candidate) => candidate.key === key)!;
  const gap = Math.max(0, item.target - item.current);
  if (gap <= 5) return `Current signal ${item.current}/100 versus ${item.target}/100 target. Maintain this strength and make the evidence easier to verify.`;
  if (gap <= 15) return `Current signal ${item.current}/100 versus ${item.target}/100 target. This is a refinement gap: one reviewed example may materially strengthen the claim.`;
  return `Current signal ${item.current}/100 versus ${item.target}/100 target. This is a priority build gap: do not rely on self-description without a reviewed outcome.`;
}

function roleApplication(routeTitle: string, key: string) {
  const investigation = /investigation/i.test(routeTitle);
  const leadership = /lead|manager/i.test(routeTitle);
  const regulatory = /regulatory|cmc/i.test(routeTitle);
  const applications: Record<string, string> = {
    technicalExecution: investigation ? "Use method controls and limitations to separate confirmed laboratory facts from plausible investigation hypotheses." : regulatory ? "Translate technical controls into clear evidence boundaries for submissions, variations, or responses." : leadership ? "Use technical risk to prioritize work, escalation, coaching, and review depth." : "Explain one method deeply enough to defend its controls, limitations, and quality impact.",
    gmpEvidence: investigation ? "Show how contemporaneous facts, traceability, and review quality changed the investigation decision." : regulatory ? "Show how controlled source evidence supports an accurate, consistent regulatory claim." : "Connect procedural compliance to the quality or patient-risk decision it protects.",
    investigationOwnership: investigation ? "Demonstrate end-to-end reasoning from problem statement through effectiveness check without overstating root cause." : leadership ? "Show how you set scope, assigned actions, escalated risk, and verified closure." : "Demonstrate one bounded decision where evidence changed the conclusion or next action.",
    documentation: regulatory ? "Build a writing sample that is concise, traceable, technically accurate, and consistent across source records." : "Show how review comments improved clarity, control, or decision quality in a document you were authorized to change.",
    leadership: leadership ? "Prove repeatable team impact through coaching, prioritization, escalation, and follow-through." : "Lead one outcome before claiming a leadership identity; name the boundary and the reviewer.",
    english: regulatory ? "Practice concise technical responses that preserve the evidence boundary under challenge." : "Practice explaining risk, evidence, and the next decision in two minutes without vague claims.",
  };
  return applications[key];
}

interface RolePlaybook {
  archetype: string;
  mandate: string;
  outcomes: string[];
  recurringWork: string[];
  decisions: string[];
  artifacts: Array<{ name: string; purpose: string; acceptance: string }>;
  keywords: string[];
  interviewQuestions: string[];
  competencyOrder: Array<"technicalExecution" | "gmpEvidence" | "investigationOwnership" | "documentation" | "leadership" | "english">;
}

function buildRolePlaybook(profile: CareerProfile, analysis: CareerAnalysis): RolePlaybook {
  const title = analysis.selectedRoute.title;
  if (/investigation/i.test(title)) return {
    archetype: "Evidence-led investigation owner",
    mandate: "Turn ambiguous quality events into proportionate, traceable decisions without overstating root cause or closing weak actions.",
    outcomes: ["Clear problem statements and controlled scope", "Evidence-ranked hypotheses", "Defensible root-cause language", "CAPA or correction matched to evidence", "Effectiveness checks that test the intended failure mode"],
    recurringWork: ["Triage deviations, OOS/OOT signals, complaints, and recurring trends", "Interview process owners and test competing explanations", "Review raw data, chronology, procedures, training, and prior events", "Facilitate cross-functional decisions and challenge unsupported conclusions", "Track actions through effectiveness review"],
    decisions: ["What is fact, inference, assumption, or unknown?", "Which hypotheses remain plausible?", "What scope is proportionate to risk?", "Is root cause supported or only most probable?", "Will the action control the demonstrated failure mode?"],
    artifacts: [
      { name: "Sanitized investigation map", purpose: "Show reasoning quality", acceptance: "Fact, hypothesis, test, conclusion, and open question are separated" },
      { name: "Evidence chronology", purpose: "Demonstrate traceability", acceptance: "Key events and evidence sources are time ordered without confidential identifiers" },
      { name: "CAPA logic note", purpose: "Connect cause to action", acceptance: "Action, owner, due date, and failure mode are explicit" },
      { name: "Effectiveness-check design", purpose: "Prove closure quality", acceptance: "Metric, window, threshold, and escalation rule are defined" },
      { name: "Trend review", purpose: "Show system thinking", acceptance: "Signal, comparator, interpretation, and decision are visible" },
      { name: "Reviewer challenge log", purpose: "Show learning", acceptance: "Material review comments and resulting changes are captured" },
    ],
    keywords: ["deviation", "OOS", "OOT", "root cause", "CAPA", "effectiveness check", "risk assessment", "data integrity", "cross-functional", "trend", "evidence", "problem statement"],
    interviewQuestions: ["How do you distinguish fact from hypothesis?", "Describe an investigation where the initial explanation was wrong.", "When is 'most probable root cause' appropriate?", "How do you prevent scope from becoming too broad or too narrow?", "What makes an effectiveness check meaningful?", "How do you challenge a senior stakeholder's unsupported conclusion?"],
    competencyOrder: ["investigationOwnership", "gmpEvidence", "documentation", "investigationOwnership", "leadership", "english", "technicalExecution", "gmpEvidence"],
  };
  if (/manager|team lead|lead$/i.test(title)) return {
    archetype: "Quality people and performance leader",
    mandate: "Create reliable team performance by combining technical judgment, workload decisions, coaching, escalation, and quality-system ownership.",
    outcomes: ["Predictable delivery without hidden quality debt", "Clear escalation and review standards", "Faster development toward independent performance", "Visible control of recurring risks", "Consistent cross-functional decisions"],
    recurringWork: ["Prioritize workload and assign competent resources", "Review technical and quality decisions", "Coach performance and close capability gaps", "Escalate risk and negotiate cross-functional tradeoffs", "Own metrics, recurring-event review, and improvement follow-through"],
    decisions: ["Who is competent and authorized for the work?", "What must be escalated now?", "Where is review depth insufficient?", "Which recurring problem deserves capacity?", "How will performance improvement be verified?"],
    artifacts: [
      { name: "Workload decision log", purpose: "Show prioritization", acceptance: "Priority, constraint, risk, owner, and outcome are explicit" },
      { name: "Coaching plan", purpose: "Show people development", acceptance: "Behavior, practice, observation, feedback, and independence threshold are defined" },
      { name: "Escalation framework", purpose: "Show judgment", acceptance: "Trigger, owner, response time, and decision boundary are clear" },
      { name: "Team metric review", purpose: "Show system control", acceptance: "Metric leads to a decision, not only reporting" },
      { name: "Improvement charter", purpose: "Show delivery", acceptance: "Baseline, target, actions, review, and sustained outcome are visible" },
      { name: "Stakeholder map", purpose: "Show influence", acceptance: "Interest, risk, message, and next commitment are recorded" },
    ],
    keywords: ["people leadership", "coaching", "workload", "inspection readiness", "escalation", "performance", "resource planning", "quality metrics", "stakeholder", "SOP governance", "risk", "continuous improvement"],
    interviewQuestions: ["How do you prioritize when everything is urgent?", "Describe how you developed someone to independent performance.", "When did you escalate early despite pressure not to?", "How do you handle a technically strong but unreliable employee?", "Which quality metrics change your decisions?", "How do you balance delivery and compliance?"],
    competencyOrder: ["leadership", "gmpEvidence", "leadership", "documentation", "investigationOwnership", "english", "technicalExecution", "leadership"],
  };
  if (/regulatory|cmc/i.test(title)) return {
    archetype: "Regulatory evidence and lifecycle owner",
    mandate: "Convert controlled technical evidence into accurate, consistent, timely regulatory positions across submissions and product lifecycle changes.",
    outcomes: ["Submission content consistent with source evidence", "Clear change-impact decisions", "Traceable authority responses", "Fewer avoidable review cycles", "Reliable cross-functional delivery"],
    recurringWork: ["Interpret requirements and define evidence needs", "Draft or review submission content", "Assess change impact across markets", "Resolve inconsistencies with technical owners", "Track commitments, questions, responses, and approvals"],
    decisions: ["What claim is supported by controlled evidence?", "Which markets or dossiers are affected?", "What is missing before submission?", "How should uncertainty be stated?", "Who must approve the position?"],
    artifacts: [
      { name: "Change-impact matrix", purpose: "Show lifecycle judgment", acceptance: "Change, markets, sections, evidence, owner, and due date are mapped" },
      { name: "Source-to-claim map", purpose: "Show traceability", acceptance: "Each material claim links to a controlled source" },
      { name: "Response strategy", purpose: "Show authority communication", acceptance: "Question, issue, evidence, position, risk, and approver are clear" },
      { name: "Submission quality checklist", purpose: "Show review control", acceptance: "Technical, consistency, traceability, and publishing checks are explicit" },
      { name: "Commitment tracker", purpose: "Show governance", acceptance: "Owner, due date, dependency, status, and evidence of closure are visible" },
      { name: "Decision memo", purpose: "Show concise influence", acceptance: "Context, options, evidence, recommendation, risk, and approval are one page" },
    ],
    keywords: ["submission", "variation", "CMC", "lifecycle", "change impact", "health authority", "dossier", "technical writing", "regulatory intelligence", "commitment", "traceability", "cross-functional"],
    interviewQuestions: ["How do you resolve conflict between a technical source and submission wording?", "Describe a change-impact assessment.", "How do you answer when evidence is incomplete?", "How do you maintain consistency across markets?", "What makes a strong authority response?", "How do you control commitments after approval?"],
    competencyOrder: ["documentation", "gmpEvidence", "documentation", "english", "technicalExecution", "leadership", "gmpEvidence", "documentation"],
  };
  if (/validation/i.test(title)) return {
    archetype: "Lifecycle validation and evidence specialist",
    mandate: "Design and interpret proportionate validation evidence that demonstrates controlled, reproducible performance across the lifecycle.",
    outcomes: ["Clear acceptance criteria", "Traceable protocol execution", "Defensible treatment of deviations", "Meaningful data interpretation", "Explicit continued-verification decisions"],
    recurringWork: ["Define scope, rationale, and acceptance criteria", "Coordinate protocol execution and data review", "Assess deviations and impact", "Interpret variability and process performance", "Write conclusions and lifecycle follow-up"],
    decisions: ["What evidence is sufficient for intended use?", "Are acceptance criteria scientifically justified?", "Does a deviation invalidate the run or require assessment?", "What variability is meaningful?", "What must be monitored after release?"],
    artifacts: [
      { name: "Protocol rationale map", purpose: "Show design logic", acceptance: "Requirement, risk, test, criterion, and rationale are connected" },
      { name: "Acceptance-criteria memo", purpose: "Show judgment", acceptance: "Scientific and procedural basis is explicit" },
      { name: "Deviation impact assessment", purpose: "Show evidence handling", acceptance: "Event, impact pathway, evidence, and disposition are separated" },
      { name: "Data interpretation sheet", purpose: "Show analytical thinking", acceptance: "Trend, variability, limitation, and conclusion are clear" },
      { name: "Validation report section", purpose: "Show writing", acceptance: "Conclusion matches evidence and unresolved actions are visible" },
      { name: "Lifecycle monitoring plan", purpose: "Show continued control", acceptance: "Metric, frequency, threshold, owner, and escalation are defined" },
    ],
    keywords: ["process validation", "qualification", "protocol", "acceptance criteria", "continued verification", "statistics", "risk assessment", "deviation", "data interpretation", "lifecycle", "report", "traceability"],
    interviewQuestions: ["How do you justify acceptance criteria?", "When does a deviation invalidate a validation run?", "How do you distinguish statistical and practical significance?", "What belongs in continued process verification?", "Describe a protocol weakness you identified.", "How do you write a conclusion when evidence is mixed?"],
    competencyOrder: ["technicalExecution", "documentation", "gmpEvidence", "investigationOwnership", "technicalExecution", "documentation", "leadership", "english"],
  };
  return {
    archetype: /microbiolog|QC/i.test(title) ? "Technical quality owner" : "Regulated-quality decision specialist",
    mandate: `Move beyond task execution to own defensible technical and quality decisions expected of a ${title}.`,
    outcomes: ["Reliable execution within approved controls", "Clear escalation of atypical evidence", "Reviewed technical documentation", "Traceable quality decisions", "Visible improvement in one recurring outcome"],
    recurringWork: ["Execute or review controlled technical work", "Interpret controls, limitations, and atypical results", "Support investigations and risk decisions", "Author or improve controlled documentation", "Coordinate review and close actions"],
    decisions: ["Is the work valid and within control?", "What requires escalation?", "What evidence supports the conclusion?", "What can be improved without weakening control?", "Who must review or authorize the next step?"],
    artifacts: [
      { name: "Method control map", purpose: "Show technical depth", acceptance: "Purpose, controls, limitations, failure signals, and escalation are clear" },
      { name: "Atypical-result reasoning note", purpose: "Show judgment", acceptance: "Fact, hypothesis, evidence, and next action are separated" },
      { name: "Reviewed document sample", purpose: "Show writing", acceptance: "Audience, scope, decision, and review changes are visible" },
      { name: "Improvement case", purpose: "Show ownership", acceptance: "Baseline, action, review, outcome, and limitation are explicit" },
      { name: "Training or coaching aid", purpose: "Show influence", acceptance: "Learner, objective, observation, feedback, and independence test are defined" },
      { name: "Evidence story bank", purpose: "Show readiness", acceptance: "Six stories separate personal action, team action, evidence, and outcome" },
    ],
    keywords: ["GMP", "method ownership", "investigation", "data integrity", "SOP", "risk assessment", "deviation", "technical writing", "cross-functional", "continuous improvement", "review", "quality decision"],
    interviewQuestions: ["Explain a method or process you know deeply.", "Describe an atypical result and how you protected the evidence.", "How do you know when to escalate?", "What document did you materially improve?", "Describe a quality improvement you owned.", "How do you distinguish participation from ownership?"],
    competencyOrder: ["technicalExecution", "gmpEvidence", "investigationOwnership", "documentation", "leadership", "english", "technicalExecution", "gmpEvidence"],
  };
}

function profilePageData(profile: CareerProfile, analysis: CareerAnalysis): BlueprintPage[] {
  const route = analysis.selectedRoute;
  const topRecommendations = analysis.recommendations;
  const competency = (key: string) => analysis.competencies.find((item) => item.key === key)!;
  const readiness = (key: string) => readinessInterpretation(analysis, key);
  const application = (key: string) => roleApplication(route.title, key);
  const playbook = buildRolePlaybook(profile, analysis);
  const requirementRows = [...playbook.outcomes, ...playbook.decisions.slice(0, 3)].map((requirement, index) => {
    const competencyKey = playbook.competencyOrder[index];
    const signal = analysis.competencies.find((item) => item.key === competencyKey)!;
    const ratio = signal.current / signal.target;
    const action = ratio >= 0.85 ? `Verify: ${playbook.artifacts[index % playbook.artifacts.length].name}` : ratio >= 0.65 ? `Build: ${playbook.artifacts[index % playbook.artifacts.length].name}` : `Priority: ${signal.label}`;
    return [requirement, index < 3 ? "Critical" : "Important", `${signal.label}: ${signal.current}/${signal.target}`, action];
  });
  const sprintFocus = [
    "Define target-role scorecard", "Validate requirements with one real source", "Name reviewer and evidence boundary", "Select the highest-value proof point",
    "Build the first evidence draft", "Obtain technical challenge", "Revise the work and claim", "Start the second proof point",
    "Translate evidence into CV language", "Rehearse two interview stories", "Run one market or sponsor conversation", "Close remaining evidence gaps", "Decide continue, adjust, or switch",
  ];

  return [
    {
      eyebrow: "READ THIS FIRST",
      title: "How to use your Blueprint",
      intro: "This document is a decision-support plan built from your answers. It helps you choose evidence to build, not predict a promotion or guarantee a hiring outcome.",
      sections: [
        { heading: `Use it as a ${profile.targetHorizonMonths}-month operating plan`, bullets: ["Review the decision summary now, then work from the milestone and worksheet pages.", "Capture proof as work is reviewed - not months later.", "Reassess the route at the end of every milestone."] },
        { heading: "Blueprint map", bullets: ["Pages 3-10: profile, route decision, role reality, requirement matrix, and readiness.", "Pages 11-19: competency evidence, proof portfolio, and priority gaps.", "Pages 20-29: milestones, 13-week execution, sponsor strategy, learning, and application readiness.", "Pages 30-38: market validation, CV, interviews, reusable worksheets, and fallback decision."] },
        { heading: "Keep claims defensible", bullets: ["Separate work you observed from work you owned.", "Do not include confidential company data.", "Ask a qualified manager or mentor to review material claims."] },
        { heading: "What this is not", paragraphs: ["It is not recruitment, legal, compensation, or employer-specific advice. Role expectations vary by site, market, product scope, and authorization."] },
      ],
    },
    {
      eyebrow: "YOUR INPUTS",
      title: `${profile.fullName}'s career profile`,
      intro: "The recommendations below depend on these user-supplied facts. Update the assessment whenever they change.",
      sections: [
        { heading: "Current context", bullets: [`Role: ${profile.currentRole}`, `Experience: ${profile.yearsExperience} years`, `Sector: ${profile.sector}`, `Location: ${profile.location}`, `Education: ${profile.education}`] },
        { heading: "Goal and constraints", bullets: [`Exact target: ${profile.targetRole || "Not specified - route remains directional"}`, `Outcome: ${profile.targetOutcome}`, `Preferred work: ${sentenceCase(profile.workPreference)}`, `Transition: ${sentenceCase(profile.transitionMode)}`, `Primary constraint: ${sentenceCase(profile.primaryConstraint)}`, `Manager support: ${sentenceCase(profile.managerSupport)}`, `Horizon: ${profile.targetHorizonMonths} months at ${profile.weeklyHours} hours per week`] },
        { heading: "Achievement anchor", paragraphs: [profile.proudAchievement || "No achievement example was supplied. Add one reviewed example before using the application pages."] },
      ],
    },
    {
      eyebrow: "DECISION SUMMARY",
      title: `Recommended route: ${route.title}`,
      intro: route.summary,
      sections: [
        { heading: `Why this route leads - ${route.fitScore}/100 fit signal`, paragraphs: [route.fitReason, ...(route.whyNow ?? [])] },
        { heading: "Preparation range", paragraphs: [`Concept planning range: ${route.horizon}. This range is directional and must be tested against real target-role requirements.`] },
        { heading: "Evidence that changes the decision", bullets: [route.evidence, `Main gap: ${route.mainGap}`, `Strongest current assets: ${analysis.strongestAssets.join(", ")}`, `Decision confidence: ${analysis.decisionConfidence}`] },
      ],
    },
    {
      eyebrow: "SCENARIO COMPARISON",
      title: "Three credible career routes",
      intro: "Choose a route by fit with your evidence, constraints, and energy—not title prestige alone.",
      visual: "routes",
      sections: analysis.routes.map((candidate) => ({
        heading: `${candidate.label}: ${candidate.title}`,
        paragraphs: [candidate.summary, `Preparation: ${candidate.horizon}. Main gap: ${candidate.mainGap}.`, candidate.fitReason],
      })),
    },
    {
      eyebrow: "BEST-FIT RATIONALE",
      title: `Why ${route.title} is the current lead`,
      sections: [
        { heading: "Leverages what already exists", paragraphs: [`The route compounds ${analysis.strongestAssets.join(", ").toLowerCase()} instead of requiring a complete professional reset.`] },
        { heading: "Closes a visible decision gap", paragraphs: [`The largest current gap is ${analysis.biggestGap.toLowerCase()}. Closing it creates evidence useful both for the preferred route and adjacent quality roles.`] },
        { heading: "Respects constraints", paragraphs: [`The plan is shaped around ${profile.weeklyHours} development hours per week, a ${profile.targetHorizonMonths}-month decision horizon, and a ${sentenceCase(profile.mobility).toLowerCase()} mobility preference.`] },
      ],
    },
    {
      eyebrow: "ROLE DECONSTRUCTION",
      title: `What ${route.title} is accountable for`,
      intro: `${playbook.archetype}. ${playbook.mandate}`,
      sections: [
        { heading: "Outcomes the role must create", bullets: playbook.outcomes },
        { heading: "Recurring work behind the title", bullets: playbook.recurringWork },
        { heading: "Your translation", paragraphs: [`Your current role is ${profile.currentRole}. The transition becomes credible when you can show at least three of these outcomes through reviewed work, not when the title changes.`] },
      ],
    },
    {
      eyebrow: "DECISION RIGHTS",
      title: `Decisions ${route.title} must defend`,
      intro: "Seniority is visible in the quality of decisions, escalation, and evidence boundaries - not only in the number of tasks completed.",
      sections: [
        { heading: "Core decisions", bullets: playbook.decisions },
        { heading: "Evidence standard", bullets: ["State what is known, inferred, assumed, and unresolved.", "Name the controlled source or reviewer behind material claims.", "Record why the chosen action is proportionate to risk.", "Define what result would change the decision."] },
        { heading: "Practice rule", paragraphs: [`For each decision above, prepare one example from ${profile.methods[0] ?? profile.qualityActivities[0] ?? "your current work"}. If no example exists, treat it as a development gap.`] },
      ],
    },
    {
      eyebrow: "ROLE REQUIREMENT MATRIX",
      title: "Requirement-to-evidence diagnostic",
      intro: "This matrix converts the role into evidence decisions. Replace concept signals with requirements from real target-role descriptions.",
      visual: "table",
      table: {
        headers: ["Target requirement", "Priority", "Current signal", "Action"],
        widths: [218, 62, 122, 98],
        rows: requirementRows,
      },
      sections: [],
    },
    {
      eyebrow: "READINESS MAP",
      title: "Competency gap overview",
      intro: "Scores combine self-ratings and selected evidence signals. They are prioritization aids, not validated competency records.",
      visual: "readiness",
      sections: analysis.competencies.map((item) => ({
        heading: item.label,
        paragraphs: [`Current concept score: ${item.current}/100. Target-role planning threshold: ${item.target}/100. Gap: ${Math.max(0, item.target - item.current)} points.`],
      })),
    },
    {
      eyebrow: "COMPETENCY 01",
      title: "Technical execution → method ownership",
      intro: `Current concept score: ${competency("technicalExecution").current}/100.`,
      sections: [
        { heading: "Your readiness interpretation", paragraphs: [readiness("technicalExecution")] },
        { heading: `Application in ${route.title}`, paragraphs: [application("technicalExecution")] },
        { heading: "What strong evidence looks like", bullets: ["Explains method purpose, controls, limitations, and escalation points.", "Connects execution choices to product and patient risk.", "Can distinguish routine execution from method suitability, verification, and validation decisions."] },
        { heading: "Your current evidence", bullets: profile.methods.length ? profile.methods : ["No specific method evidence selected."] },
        { heading: "Next proof point", paragraphs: ["Choose one frequently used method and produce a one-page, non-confidential control map reviewed by a qualified colleague."] },
      ],
    },
    {
      eyebrow: "COMPETENCY 02",
      title: "GMP evidence and decision quality",
      intro: `Current concept score: ${competency("gmpEvidence").current}/100.`,
      sections: [
        { heading: "Your readiness interpretation", paragraphs: [readiness("gmpEvidence")] },
        { heading: `Application in ${route.title}`, paragraphs: [application("gmpEvidence")] },
        { heading: "What strong evidence looks like", bullets: ["Records facts contemporaneously and distinguishes observation from inference.", "Uses approved procedures and escalates ambiguity.", "Can explain why traceability and review controls matter."] },
        { heading: "Your current activities", bullets: profile.qualityActivities.length ? profile.qualityActivities : ["No specific quality-system activity selected."] },
        { heading: "Next proof point", paragraphs: ["Ask for structured feedback on one reviewed record, deviation input, or controlled change contribution and capture the lesson without copying confidential content."] },
      ],
    },
    {
      eyebrow: "COMPETENCY 03",
      title: "Investigation ownership",
      intro: `Current concept score: ${competency("investigationOwnership").current}/100.`,
      sections: [
        { heading: "Your readiness interpretation", paragraphs: [readiness("investigationOwnership")] },
        { heading: `Application in ${route.title}`, paragraphs: [application("investigationOwnership")] },
        { heading: "The senior-level shift", paragraphs: ["Move from supplying facts to framing the problem, testing plausible hypotheses, controlling scope, and verifying whether the action worked."] },
        { heading: "Evidence checklist", bullets: ["Problem statement separates confirmed facts from open questions.", "Hypotheses are testable and tied to evidence.", "Root-cause language matches the strength of the evidence.", "CAPA or correction has a defined effectiveness check."] },
        { heading: "Next proof point", paragraphs: [topRecommendations.find((item) => item.competency === "investigationOwnership")?.title ?? "Own one bounded investigation milestone."] },
      ],
    },
    {
      eyebrow: "COMPETENCY 04",
      title: "Technical documentation",
      intro: `Current concept score: ${competency("documentation").current}/100.`,
      sections: [
        { heading: "Your readiness interpretation", paragraphs: [readiness("documentation")] },
        { heading: `Application in ${route.title}`, paragraphs: [application("documentation")] },
        { heading: "What advances the profile", bullets: ["A controlled document has a clear user, decision, scope, and acceptance basis.", "Tables and figures reduce ambiguity instead of decorating the document.", "Review comments are incorporated and traceable."] },
        { heading: "Your current evidence", bullets: profile.evidenceActivities.length ? profile.evidenceActivities : ["No specific authorship evidence selected."] },
        { heading: "Next proof point", paragraphs: ["Create or materially improve one controlled instruction, protocol section, report section, or knowledge-transfer aid within your authorized scope."] },
      ],
    },
    {
      eyebrow: "COMPETENCY 05",
      title: "Leadership before title",
      intro: `Current concept score: ${competency("leadership").current}/100.`,
      sections: [
        { heading: "Your readiness interpretation", paragraphs: [readiness("leadership")] },
        { heading: `Application in ${route.title}`, paragraphs: [application("leadership")] },
        { heading: "Leadership evidence can start small", bullets: ["Clarify a recurring decision.", "Coach one colleague to independent performance.", "Coordinate a bounded improvement.", "Escalate risk early and close actions reliably."] },
        { heading: "Avoid weak claims", bullets: ["Do not equate attendance with leadership.", "Do not claim team outcomes without your specific contribution.", "Do not use confidential metrics outside the company."] },
        { heading: "Next proof point", paragraphs: ["Choose a 6–10 week improvement with one outcome metric and one named reviewer."] },
      ],
    },
    {
      eyebrow: "COMPETENCY 06",
      title: "English for technical influence",
      intro: `Current concept score: ${competency("english").current}/100 based on the selected level: ${sentenceCase(profile.englishLevel)}.`,
      sections: [
        { heading: "Your readiness interpretation", paragraphs: [readiness("english")] },
        { heading: `Application in ${route.title}`, paragraphs: [application("english")] },
        { heading: "Priority situations", bullets: ["Explain an investigation without overclaiming.", "Summarize risk for a cross-functional audience.", "Answer an interview question using situation, action, evidence, and learning.", "Ask precise clarification questions during an audit or review."] },
        { heading: "Weekly practice", paragraphs: ["Record one two-minute technical explanation, listen for unclear claims, then repeat with a shorter structure and explicit evidence boundary."] },
      ],
    },
    {
      eyebrow: "EVIDENCE PORTFOLIO",
      title: "What to collect without exposing confidential data",
      sections: [
        { heading: "Evidence categories", bullets: ["Qualification or training completion records you are authorized to retain.", "A sanitized list of methods and decisions you can explain.", "Manager-reviewed descriptions of improvements and your contribution.", "Public learning records and personal reflection notes.", "A story bank that removes product, batch, patient, supplier, and site identifiers."] },
        { heading: "Evidence register fields", bullets: ["Date and context", "Your responsibility", "Decision or action", "Evidence reviewed", "Outcome", "Reviewer", "What you would do differently"] },
      ],
    },
    {
      eyebrow: "PORTFOLIO ARCHITECTURE",
      title: `Six proof assets for ${route.title}`,
      intro: "These are sanitized descriptions and working aids, not copies of controlled company records. Each asset must survive reviewer challenge.",
      visual: "table",
      table: {
        headers: ["Proof asset", "Why it matters", "Acceptance test"],
        widths: [138, 122, 240],
        rows: playbook.artifacts.map((artifact) => [artifact.name, artifact.purpose, artifact.acceptance]),
      },
      sections: [],
    },
    {
      eyebrow: "GAP PRIORITIES",
      title: "The three gaps to address first",
      sections: topRecommendations.map((item, index) => ({
        heading: `${index + 1}. ${item.title}`,
        paragraphs: [item.rationale, `First action: ${item.firstAction}`, `Proof of completion: ${item.proof}`, `Estimated focused effort: ${item.effortHours} hours.`, `Free Atlas reference: ${item.resource}.`],
      })),
    },
    {
      eyebrow: `${profile.targetHorizonMonths}-MONTH PLAN`,
      title: `${profile.targetHorizonMonths}-month milestone overview`,
      intro: "The plan is deliberately evidence-based. Completion means a reviewed outcome exists—not that time has passed.",
      visual: "milestones",
      sections: analysis.milestones.map((milestone) => ({ heading: `${milestone.months}: ${milestone.title}`, paragraphs: [milestone.outcome] })),
    },
    ...analysis.milestones.map((milestone, index): BlueprintPage => ({
      eyebrow: `MILESTONE ${String(index + 1).padStart(2, "0")}`,
      title: `${milestone.months} — ${milestone.title}`,
      intro: milestone.outcome,
      sections: [
        { heading: "Your action sequence", bullets: milestone.actions },
        { heading: "Exit evidence", bullets: milestone.evidence },
        { heading: "Success test", paragraphs: [milestone.successMetric ?? "A reviewed outcome exists and the next decision is explicit."] },
        { heading: "Failure signal", paragraphs: ["If the activity has no reviewer, no decision boundary, or no observable outcome, reduce the scope before investing more time."] },
      ],
    })),
    {
      eyebrow: "WEEKLY OPERATING RHYTHM",
      title: `${profile.weeklyHours} hours per week without burnout`,
      sections: [
        { heading: "Suggested allocation", bullets: [`${Math.max(1, Math.round(profile.weeklyHours * 0.35))} hours: role-relevant project or evidence building.`, `${Math.max(1, Math.round(profile.weeklyHours * 0.25))} hours: targeted learning.`, `${Math.max(1, Math.round(profile.weeklyHours * 0.2))} hours: writing and reflection.`, `${Math.max(1, Math.round(profile.weeklyHours * 0.2))} hours: feedback, networking, or role-market validation.`] },
        { heading: "Weekly review questions", bullets: ["What evidence changed this week?", "Which assumption became weaker or stronger?", "What will I stop doing to protect the priority?", "Who needs to review the next decision?"] },
      ],
    },
    {
      eyebrow: "13-WEEK EXECUTION",
      title: "Your first quarter, week by week",
      intro: `${profile.weeklyHours} hours per week creates approximately ${profile.weeklyHours * 13} focused hours. Protect the evidence-building block before adding more courses.`,
      visual: "table",
      table: {
        headers: ["Week", "Primary focus", "Required output"],
        widths: [42, 242, 216],
        rows: sprintFocus.map((focus, index) => [String(index + 1), focus, index < 4 ? "Decision or scope record" : index < 8 ? "Reviewed evidence increment" : index < 12 ? "Market-ready evidence or signal" : "Written route decision"]),
      },
      sections: [],
    },
    {
      eyebrow: "SPONSOR STRATEGY",
      title: "Create access to the work you need",
      intro: `Manager or sponsor support is currently ${profile.managerSupport}. The plan must work with that reality rather than assuming development opportunities will appear.`,
      sections: [
        { heading: "The development request", paragraphs: [`Ask for one bounded opportunity connected to ${topRecommendations[0].title.toLowerCase()}. Define scope, reviewer, confidentiality boundary, and what normal work must still be delivered.`] },
        { heading: "Suggested conversation structure", bullets: ["Business need: name the recurring risk, workload, or capability gap.", "Development value: explain the specific decision skill you need to demonstrate.", "Low-risk scope: propose a bounded contribution with review checkpoints.", "Success evidence: agree what observable output would count.", "Fallback: request observation, shadowing, or retrospective review if ownership is unavailable."] },
        { heading: "If support remains unavailable", paragraphs: [profile.transitionMode === "internal" ? "Use a cross-functional reviewer, adjacent project, or documented shadowing plan. Reassess whether internal progression is realistic after two declined bounded requests." : "Build sanitized public learning evidence, mentor-reviewed case exercises, and external market conversations while protecting employer confidentiality."] },
      ],
    },
    {
      eyebrow: "LEARNING PLAN",
      title: "Learn only what supports the next proof point",
      sections: topRecommendations.map((item) => ({
        heading: item.resource,
        paragraphs: [item.rationale, `Apply it immediately through: ${item.title.toLowerCase()}.`],
      })),
    },
    {
      eyebrow: "PORTFOLIO CHECKLIST",
      title: "Evidence before application",
      sections: [
        { heading: "Core proof", bullets: ["Current role scope is accurately described.", "Three technical examples show decisions, not task lists.", "One investigation example separates fact, hypothesis, action, and effectiveness.", "One documentation example shows review and revision.", "One leadership example shows an outcome and your contribution."] },
        { heading: "Verification", bullets: ["No confidential data is included.", "Claims are consistent across CV, LinkedIn, and interviews.", "A trusted reviewer has challenged at least three key claims."] },
      ],
    },
    {
      eyebrow: "JOB SEARCH SYSTEM",
      title: `Validate the market for ${route.title}`,
      intro: "A strong plan learns from the market before sending high-volume applications. Track repeated requirements, evidence accepted, and gaps challenged.",
      visual: "table",
      table: {
        headers: ["Stage", "Minimum signal", "What to capture", "Decision"],
        widths: [92, 112, 190, 106],
        rows: [
          ["Role research", "8 descriptions", "Repeated requirements and exclusions", "Keep or narrow target"],
          ["Human validation", "3 conversations", "Language used by hiring managers", "Adjust positioning"],
          ["Targeted applications", "5 strong fits", "Screen response and challenged gaps", "Improve evidence"],
          ["Interviews", "3 processes", "Questions, objections, energy, outcome", "Continue or switch"],
          ["Route review", "One written decision", "Evidence gained, unresolved risk, next bet", "Commit 90 days"],
        ],
      },
      sections: [],
    },
    {
      eyebrow: "CV POSITIONING",
      title: `Position for ${route.title}`,
      sections: [
        { heading: "Headline direction", paragraphs: [`${profile.currentRole} | ${analysis.strongestAssets.slice(0, 2).join(" + ")} | Building evidence for ${route.title}`] },
        { heading: "Personalized evidence draft", paragraphs: [profile.proudAchievement ? `Draft only - verify every claim: ${profile.proudAchievement} Position your specific action, review boundary, and observable result before adding it to a CV.` : `Draft prompt: In ${profile.sector}, I [specific action] through [method or quality process], with [reviewer/evidence], resulting in [observable quality, risk, reliability, or learning outcome].`] },
        { heading: "Bullet structure", bullets: ["Context: regulated scope and problem.", "Action: your specific decision or contribution.", "Evidence: what was reviewed or measured.", "Outcome: quality, reliability, time, risk, or learning impact."] },
        { heading: "Avoid", bullets: ["Unverified percentages.", "Confidential product or batch details.", "Generic claims such as hardworking, passionate, or responsible without evidence."] },
      ],
    },
    {
      eyebrow: "INTERVIEW STORY BANK",
      title: "Six stories to prepare",
      sections: [
        { heading: "Technical and quality", bullets: [`Explain ${profile.methods[0] ?? "one method or process"} deeply, including controls and limitations.`, `Use ${profile.qualityActivities[0] ?? "one deviation, unexpected result, or quality risk"} to show careful evidence handling.`, `Use ${profile.evidenceActivities[0] ?? "one document or control"} to show review and improvement.`] },
        { heading: "Leadership and learning", bullets: [profile.proudAchievement ? `Turn your stated achievement into a story: ${profile.proudAchievement}` : "Prepare one bounded outcome you personally helped deliver.", "A disagreement or ambiguity you resolved professionally.", "A mistake or weak assumption that changed your practice."] },
        { heading: "Evidence boundary", paragraphs: ["For every story, label what you personally did, what the team did, what was reviewed, and what remains uncertain."] },
      ],
    },
    {
      eyebrow: "INTERVIEW DRILL",
      title: `Six questions for ${route.title}`,
      intro: "Do not memorize polished answers. Build a defensible evidence structure, then practice responding to challenge and uncertainty.",
      sections: playbook.interviewQuestions.map((question, index) => ({
        heading: `${index + 1}. ${question}`,
        paragraphs: [`Evidence anchor: ${index === 0 ? profile.methods[0] ?? "a role-relevant technical process" : index === 1 ? profile.qualityActivities[0] ?? "a quality event or decision" : index === 2 ? profile.evidenceActivities[0] ?? "a reviewed artifact or outcome" : playbook.artifacts[index % playbook.artifacts.length].name}. State your action, review boundary, outcome, limitation, and lesson.`],
      })),
    },
    {
      eyebrow: "WORKSHEET 01",
      title: `${route.title} role scorecard`,
      intro: "Complete this from 5-8 real job descriptions or one controlled internal role profile. Do not rely on the role title alone.",
      visual: "worksheet",
      sections: [
        { heading: "Requirement", bullets: ["Technical or method requirement", "Quality-system decision", "Documentation or communication", "Leadership or influence"] },
        { heading: "Classification", bullets: ["Evidence I can defend", "Gap I can close", "Unknown to validate", "Not relevant to my target"] },
        { heading: "Decision rule", paragraphs: ["Continue the route only when the most common requirements can be mapped to credible evidence or a realistic development action within your horizon."] },
      ],
    },
    {
      eyebrow: "WORKSHEET 02",
      title: "Evidence and reviewer log",
      intro: `Use this register for ${route.title}. Keep confidential identifiers and controlled records out of the document.`,
      visual: "worksheet",
      sections: [
        { heading: "Record for each proof point", bullets: ["Context and date", "Your authorized responsibility", "Decision or action", "Evidence reviewed", "Observable outcome", "Reviewer and feedback", "What changed after review"] },
        { heading: "Quality check", paragraphs: ["A proof point is usable only when your individual contribution, the evidence boundary, and the review status are clear."] },
      ],
    },
    {
      eyebrow: "WORKSHEET 03",
      title: "Your first 90-day sprint",
      intro: `Primary focus: ${topRecommendations[0].title}. Available capacity: approximately ${profile.weeklyHours * 13} hours across 13 weeks.`,
      visual: "worksheet",
      sections: [
        { heading: "Weeks 1-2 - define", bullets: [topRecommendations[0].firstAction ?? "Define the evidence target.", "Name the reviewer and agree the evidence boundary."] },
        { heading: "Weeks 3-9 - build", bullets: [`Apply the work through ${profile.methods[0] ?? profile.qualityActivities[0] ?? "one current responsibility"}.`, "Capture decisions and feedback while the work is active."] },
        { heading: "Weeks 10-13 - review", bullets: ["Obtain reviewer challenge.", "Revise the claim and decide the next milestone."] },
      ],
    },
    {
      eyebrow: "WORKSHEET 04",
      title: "Transition signal tracker",
      intro: `Track evidence from ${profile.transitionMode === "internal" ? "internal career conversations" : profile.transitionMode === "external" ? "external applications and interviews" : "both internal and external conversations"}.`,
      visual: "worksheet",
      sections: [
        { heading: "Signal fields", bullets: ["Organization / role", "Requirement repeated", "Evidence accepted", "Gap challenged", "Energy after conversation", "Next action and date"] },
        { heading: "Decision after three signals", paragraphs: [`Keep ${route.title}, adjust the scope, or switch to ${analysis.routes.find((candidate) => candidate.id !== route.id)?.title ?? "an adjacent route"}. Record why.`] },
      ],
    },
    {
      eyebrow: "CONTINGENCY ROUTES",
      title: "Decision triggers, assumptions, and fallback plan",
      sections: [
        { heading: "Reconsider the lead route when", bullets: ["Target-role interviews repeatedly demand evidence you cannot build in the current environment.", "The work itself does not sustain your interest after a real project trial.", "Mobility or market constraints materially change.", "A credible adjacent role offers faster ownership and stronger mentorship."] },
        { heading: "Open assumptions", bullets: analysis.assumptions },
        { heading: "90-day decision", paragraphs: [`After 90 days, compare new evidence against ${analysis.routes[1].title} and ${analysis.routes[2].title}. Keep the route that produces the strongest combination of credible evidence, energy, and real opportunity.`] },
      ],
    },
  ];
}

function drawHeader(doc: PDFKit.PDFDocument, pageNumber: number, eyebrow: string) {
  doc.rect(0, 0, doc.page.width, 36).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(TEAL_LIGHT).text("LIFE SCIENCE ATLAS", 48, 14, { characterSpacing: 1.3 });
  doc.font("Helvetica").fillColor("#9fb1c5").text(eyebrow, 250, 14, { width: 295, align: "right", characterSpacing: 0.8 });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(String(pageNumber).padStart(2, "0"), 500, 774, { width: 45, align: "right" });
}

function drawSection(doc: PDFKit.PDFDocument, heading: string, paragraphs: string[] = [], bullets: string[] = []) {
  if (doc.y > 700) return;
  doc.moveDown(0.35).font("Helvetica-Bold").fontSize(12).fillColor(TEAL).text(pdfText(heading), 48, doc.y, { width: 500 });
  doc.moveDown(0.3);
  paragraphs.forEach((paragraph) => {
    if (doc.y > 748) return;
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(pdfText(paragraph), 48, doc.y, { width: 500, lineGap: 3 });
    doc.moveDown(0.5);
  });
  bullets.forEach((bullet) => {
    if (doc.y > 748) return;
    doc.circle(56, doc.y + 5, 2).fill(GOLD);
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(pdfText(bullet), 68, doc.y, { width: 478, lineGap: 2 });
    doc.moveDown(0.35);
  });
}

function drawReadinessVisual(doc: PDFKit.PDFDocument, analysis: CareerAnalysis) {
  const startY = doc.y + 6;
  doc.roundedRect(48, startY, 500, 66, 8).fill("#e8f7f5");
  doc.font("Helvetica-Bold").fontSize(28).fillColor(NAVY_LIGHT).text(`${analysis.readinessIndex}%`, 66, startY + 15, { width: 90 });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text("ROLE READINESS SIGNAL", 160, startY + 17, { width: 200 });
  doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(`${analysis.decisionConfidence} decision confidence`, 160, startY + 35, { width: 260 });
  let y = startY + 96;
  analysis.competencies.forEach((item) => {
    const gap = Math.max(0, item.target - item.current);
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text(item.label, 48, y, { width: 170 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`${item.current} current / ${item.target} target`, 388, y, { width: 160, align: "right" });
    doc.roundedRect(48, y + 18, 500, 10, 5).fill("#dfe7ef");
    doc.roundedRect(48, y + 18, 500 * item.target / 100, 10, 5).fill("#f3dfad");
    doc.roundedRect(48, y + 18, 500 * item.current / 100, 10, 5).fill(TEAL);
    doc.font("Helvetica").fontSize(7.5).fillColor(gap > 15 ? "#9a6a08" : MUTED).text(`Gap ${gap}`, 48, y + 33, { width: 500, align: "right" });
    y += 62;
  });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("Teal = current self-reported evidence signal. Gold = target planning threshold. Scores are not validated competency records.", 48, y + 3, { width: 500 });
}

function drawRouteVisual(doc: PDFKit.PDFDocument, analysis: CareerAnalysis) {
  let y = doc.y + 8;
  analysis.routes.forEach((route) => {
    const selected = route.id === analysis.selectedRoute.id;
    doc.roundedRect(48, y, 500, 142, 9).fillAndStroke(selected ? "#e8f7f5" : "#ffffff", selected ? TEAL : "#d7e0ea");
    doc.font("Helvetica-Bold").fontSize(8).fillColor(selected ? TEAL : MUTED).text(`${route.label.toUpperCase()} / ${route.readinessLabel?.toUpperCase()}`, 66, y + 15, { width: 300, characterSpacing: 0.7 });
    doc.font("Helvetica-Bold").fontSize(14).fillColor(NAVY_LIGHT).text(route.title, 66, y + 34, { width: 340 });
    doc.font("Helvetica-Bold").fontSize(22).fillColor(selected ? TEAL : GOLD).text(`${route.fitScore}`, 446, y + 26, { width: 76, align: "right" });
    doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text("FIT SIGNAL", 446, y + 52, { width: 76, align: "right" });
    doc.font("Helvetica").fontSize(9).fillColor(INK).text(route.summary, 66, y + 64, { width: 430, lineGap: 2 });
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#9a6a08").text("MAIN RISK", 66, y + 105, { width: 75 });
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(route.risks?.join("; ") ?? route.mainGap, 142, y + 105, { width: 354 });
    y += 156;
  });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("Fit signals prioritize comparison; they do not estimate hiring probability.", 48, y + 2, { width: 500 });
}

function drawMilestonesVisual(doc: PDFKit.PDFDocument, analysis: CareerAnalysis) {
  let y = doc.y + 5;
  analysis.milestones.forEach((milestone, index) => {
    doc.circle(66, y + 17, 15).fill(index === 0 ? GOLD : TEAL);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY).text(String(index + 1), 58, y + 12, { width: 16, align: "center" });
    if (index < analysis.milestones.length - 1) doc.moveTo(66, y + 34).lineTo(66, y + 112).lineWidth(2).strokeColor("#cbd8e3").stroke();
    doc.font("Helvetica-Bold").fontSize(8).fillColor(TEAL).text(milestone.months.toUpperCase(), 96, y + 2, { width: 420, characterSpacing: 0.5 });
    doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY_LIGHT).text(milestone.title, 96, y + 19, { width: 410 });
    doc.font("Helvetica").fontSize(9).fillColor(INK).text(milestone.outcome, 96, y + 42, { width: 410, lineGap: 2 });
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#9a6a08").text("EXIT TEST", 96, y + 83, { width: 62 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(milestone.successMetric ?? "Reviewed outcome exists.", 160, y + 83, { width: 346 });
    y += 126;
  });
}

function drawWorksheetLines(doc: PDFKit.PDFDocument) {
  let y = Math.max(doc.y + 12, 455);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("NOTES / EVIDENCE", 48, y, { characterSpacing: 0.8 });
  y += 22;
  while (y < 730) {
    doc.moveTo(48, y).lineTo(548, y).lineWidth(0.5).strokeColor("#cbd8e3").stroke();
    y += 32;
  }
}

function drawTable(doc: PDFKit.PDFDocument, table: NonNullable<BlueprintPage["table"]>) {
  const x = 48;
  const y = doc.y + 10;
  const totalWidth = table.widths.reduce((sum, width) => sum + width, 0);
  const headerHeight = 30;
  const availableHeight = 730 - y - headerHeight;
  const rowHeight = Math.min(62, availableHeight / table.rows.length);
  const fontSize = table.rows.length > 10 ? 7.2 : table.rows.length > 7 ? 7.5 : 8;
  doc.roundedRect(x, y, totalWidth, headerHeight + rowHeight * table.rows.length, 7).fillAndStroke("#ffffff", "#cbd8e3");
  doc.roundedRect(x, y, totalWidth, headerHeight, 7).fill(NAVY_LIGHT);
  let cursorX = x;
  table.headers.forEach((header, index) => {
    doc.font("Helvetica-Bold").fontSize(7.4).fillColor("#ffffff").text(pdfText(header.toUpperCase()), cursorX + 7, y + 10, { width: table.widths[index] - 14, height: 14 });
    cursorX += table.widths[index];
  });
  table.rows.forEach((row, rowIndex) => {
    const rowY = y + headerHeight + rowIndex * rowHeight;
    if (rowIndex % 2 === 1) doc.rect(x, rowY, totalWidth, rowHeight).fill("#f1f6f9");
    doc.moveTo(x, rowY).lineTo(x + totalWidth, rowY).lineWidth(0.4).strokeColor("#d7e0ea").stroke();
    let cellX = x;
    row.forEach((cell, cellIndex) => {
      if (cellIndex > 0) doc.moveTo(cellX, rowY).lineTo(cellX, rowY + rowHeight).lineWidth(0.35).strokeColor("#d7e0ea").stroke();
      doc.font(cellIndex === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize).fillColor(cellIndex === row.length - 1 ? TEAL : INK).text(pdfText(cell), cellX + 7, rowY + 7, { width: table.widths[cellIndex] - 14, height: rowHeight - 12, lineGap: 1 });
      cellX += table.widths[cellIndex];
    });
  });
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text("Working diagnostic - replace concept signals with reviewed evidence and current target-role requirements.", x, y + headerHeight + rowHeight * table.rows.length + 10, { width: totalWidth });
}

function drawContentPage(doc: PDFKit.PDFDocument, page: BlueprintPage, pageNumber: number, analysis: CareerAnalysis) {
  drawHeader(doc, pageNumber, page.eyebrow);
  doc.font("Helvetica-Bold").fontSize(24).fillColor(NAVY_LIGHT).text(pdfText(page.title), 48, 72, { width: 500, lineGap: 2 });
  doc.moveDown(0.55);
  if (page.intro) {
    doc.font("Helvetica").fontSize(11).fillColor(MUTED).text(pdfText(page.intro), 48, doc.y, { width: 500, lineGap: 4 });
    doc.moveDown(0.75);
  }
  if (page.visual === "readiness") drawReadinessVisual(doc, analysis);
  else if (page.visual === "routes") drawRouteVisual(doc, analysis);
  else if (page.visual === "milestones") drawMilestonesVisual(doc, analysis);
  else if (page.visual === "table" && page.table) drawTable(doc, page.table);
  else {
    page.sections.forEach((section) => drawSection(doc, section.heading, section.paragraphs, section.bullets));
    if (page.visual === "worksheet") drawWorksheetLines(doc);
  }
  doc.moveTo(48, 758).lineTo(548, 758).lineWidth(0.6).strokeColor("#d7e0ea").stroke();
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text("Personal planning support - not a hiring, salary, legal, or employer-specific guarantee.", 48, 772, { width: 420 });
}

function drawCover(doc: PDFKit.PDFDocument, profile: CareerProfile, analysis: CareerAnalysis) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEAL_LIGHT).text("LIFE SCIENCE ATLAS", 54, 60, { characterSpacing: 1.8 });
  doc.font("Helvetica-Bold").fontSize(34).fillColor("#ffffff").text(pdfText(profile.fullName), 54, 180, { width: 470 });
  doc.moveDown(0.3).font("Helvetica").fontSize(23).fillColor("#d7e4f1").text("Personal Career Blueprint", 54, doc.y, { width: 470 });
  doc.moveDown(0.35).font("Helvetica-Bold").fontSize(15).fillColor(GOLD).text(pdfText(analysis.selectedRoute.title), 54, doc.y, { width: 470 });
  doc.moveDown(2.4);
  doc.moveTo(54, doc.y).lineTo(510, doc.y).lineWidth(1).strokeColor("#27445c").stroke();
  doc.moveDown(1.2).font("Helvetica").fontSize(10.5).fillColor("#a9bacb").text(`Prepared from your assessment / ${profile.targetHorizonMonths}-month planning horizon / ${profile.weeklyHours} hours/week`, 54, doc.y, { width: 450, lineGap: 4 });
  const y = 545;
  const points = [
    [72, y + 78],
    [170, y + 45],
    [270, y + 58],
    [376, y + 18],
    [500, y - 35],
  ];
  doc.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, pointY]) => doc.lineTo(x, pointY));
  doc.lineWidth(2).strokeColor(GOLD).stroke();
  points.forEach(([x, pointY], index) => {
    doc.circle(x, pointY, 7).fill(index === points.length - 1 ? GOLD : TEAL);
    doc.circle(x, pointY, 3).fill(NAVY);
  });
  doc.font("Helvetica").fontSize(8).fillColor("#7890a6").text("Generated career decision-support artifact / Keep confidential", 54, 780, { width: 480 });
}

export function careerBlueprintPdf(profile: CareerProfile): Promise<Buffer> {
  const analysis = buildCareerAnalysis(profile, profile.selectedRouteId);
  const pages = profilePageData(profile, analysis);
  if (pages.length !== 37) throw new Error(`Career Blueprint requires 37 content pages; received ${pages.length}`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `${profile.fullName} — Personal Career Blueprint`, Author: "Life Science Atlas", Subject: analysis.selectedRoute.title } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawCover(doc, profile, analysis);
    pages.forEach((page, index) => {
      doc.addPage({ size: "A4", margin: 48, layout: "portrait" });
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(PAPER);
      drawContentPage(doc, page, index + 2, analysis);
    });
    doc.end();
  });
}

export { careerProfileFilename };
