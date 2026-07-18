import { z } from "zod";

export const careerTracks = ["qc-microbiology", "quality-assurance", "regulatory-affairs", "manufacturing-quality", "other"] as const;
export const careerTrackSchema = z.enum(careerTracks);
export type CareerTrack = z.infer<typeof careerTrackSchema>;

export const competencyKeys = [
  "technicalExecution",
  "gmpEvidence",
  "investigationOwnership",
  "documentation",
  "leadership",
  "english",
] as const;
export type CompetencyKey = (typeof competencyKeys)[number];

export const careerProfileSchema = z.object({
  version: z.literal(1),
  fullName: z.string().trim().min(2).max(80),
  currentRole: z.string().trim().min(2).max(100),
  careerTrack: careerTrackSchema,
  yearsExperience: z.number().min(0).max(45),
  sector: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(100),
  education: z.string().trim().min(2).max(140),
  targetOutcome: z.string().trim().min(8).max(260),
  targetHorizonMonths: z.union([z.literal(6), z.literal(12), z.literal(18), z.literal(24)]),
  weeklyHours: z.union([z.literal(2), z.literal(4), z.literal(6), z.literal(8), z.literal(10)]),
  mobility: z.enum(["stay-local", "domestic", "regional", "global"]),
  englishLevel: z.enum(["basic", "intermediate", "upper-intermediate", "advanced"]),
  targetRole: z.string().trim().max(120).default(""),
  transitionMode: z.enum(["internal", "external", "open-to-both"]).default("open-to-both"),
  workPreference: z.enum(["technical-specialist", "quality-systems", "people-leadership", "cross-functional"]).default("technical-specialist"),
  primaryConstraint: z.enum(["limited-ownership", "time", "english", "experience", "manager-support", "location", "unclear-direction"]).default("limited-ownership"),
  managerSupport: z.enum(["yes", "uncertain", "no"]).default("uncertain"),
  proudAchievement: z.string().trim().max(320).default(""),
  methods: z.array(z.string().trim().min(2).max(100)).max(20),
  qualityActivities: z.array(z.string().trim().min(2).max(100)).max(20),
  evidenceActivities: z.array(z.string().trim().min(2).max(100)).max(20),
  selectedRouteId: z.string().trim().min(2).max(80).optional(),
  ratings: z.object({
    technicalExecution: z.number().int().min(1).max(5),
    gmpEvidence: z.number().int().min(1).max(5),
    investigationOwnership: z.number().int().min(1).max(5),
    documentation: z.number().int().min(1).max(5),
    leadership: z.number().int().min(1).max(5),
  }),
});

export type CareerProfile = z.infer<typeof careerProfileSchema>;

export interface CareerCompetency {
  key: CompetencyKey;
  label: string;
  current: number;
  target: number;
}

export interface CareerRoute {
  id: string;
  label: "Best fit" | "Adjacent" | "Stretch";
  title: string;
  summary: string;
  horizon: string;
  evidence: string;
  mainGap: string;
  fitReason: string;
  fitScore?: number;
  readinessLabel?: "Build now" | "Validate first" | "Longer-term bet";
  whyNow?: string[];
  risks?: string[];
}

export interface CareerRecommendation {
  competency: CompetencyKey;
  title: string;
  rationale: string;
  href: string;
  resource: string;
  firstAction?: string;
  proof?: string;
  effortHours?: number;
}

export interface CareerMilestone {
  months: string;
  title: string;
  outcome: string;
  actions?: string[];
  evidence?: string[];
  successMetric?: string;
}

export interface CareerAnalysis {
  routes: CareerRoute[];
  selectedRoute: CareerRoute;
  competencies: CareerCompetency[];
  recommendations: CareerRecommendation[];
  milestones: CareerMilestone[];
  strongestAssets: string[];
  biggestGap: string;
  assumptions: string[];
  readinessIndex: number;
  decisionConfidence: "Exploratory" | "Directional" | "Strong direction";
  confidenceReasons: string[];
}

export const CAREER_PROFILE_STORAGE_KEY = "lsa_career_profile_v1";

export const defaultCareerProfile: CareerProfile = {
  version: 1,
  fullName: "",
  currentRole: "QC Microbiology Analyst",
  careerTrack: "qc-microbiology",
  yearsExperience: 3,
  sector: "Pharmaceutical manufacturing",
  location: "",
  education: "Bachelor's degree in Biotechnology or a related life-science field",
  targetOutcome: "Broader responsibility and stronger compensation without leaving regulated manufacturing quality",
  targetHorizonMonths: 12,
  weeklyHours: 6,
  mobility: "stay-local",
  englishLevel: "upper-intermediate",
  targetRole: "",
  transitionMode: "open-to-both",
  workPreference: "technical-specialist",
  primaryConstraint: "limited-ownership",
  managerSupport: "uncertain",
  proudAchievement: "",
  methods: ["Microbial enumeration", "Environmental monitoring", "Water microbiology"],
  qualityActivities: ["Deviation support", "OOS / OOT investigation"],
  evidenceActivities: ["SOP / work-instruction authorship"],
  ratings: {
    technicalExecution: 4,
    gmpEvidence: 3,
    investigationOwnership: 2,
    documentation: 4,
    leadership: 2,
  },
};

const labels: Record<CompetencyKey, string> = {
  technicalExecution: "Technical execution",
  gmpEvidence: "GMP evidence",
  investigationOwnership: "Investigation ownership",
  documentation: "Documentation",
  leadership: "Leadership",
  english: "English",
};

const routeSets: Record<CareerTrack, CareerRoute[]> = {
  "qc-microbiology": [
    {
      id: "senior-qc-microbiologist",
      label: "Best fit",
      title: "Senior QC Microbiologist",
      summary: "Step up within QC to own more complex testing strategy and quality impact.",
      horizon: "9–15 months",
      evidence: "Method ownership, investigation outcomes, reviewed technical documentation",
      mainGap: "Leading improvements with measurable quality impact",
      fitReason: "Builds on existing QC experience while adding ownership and cross-functional evidence.",
    },
    {
      id: "qa-investigation-specialist",
      label: "Adjacent",
      title: "QA Investigation Specialist",
      summary: "Move into QA to lead investigations, root cause analysis, and CAPA quality.",
      horizon: "12–18 months",
      evidence: "Investigation reports, CAPA effectiveness, quality-system decisions",
      mainGap: "Formal QA-system depth and stakeholder influence",
      fitReason: "A credible adjacent route when investigation work is the strongest source of energy.",
    },
    {
      id: "qc-team-lead",
      label: "Stretch",
      title: "QC Team Lead",
      summary: "Lead people and daily lab performance across a controlled process.",
      horizon: "15–24 months",
      evidence: "People development, workload decisions, SOP governance, performance improvement",
      mainGap: "Demonstrated leadership and team-management evidence",
      fitReason: "Higher leadership upside, but it requires a broader evidence base and more sponsorship.",
    },
  ],
  "quality-assurance": [
    {
      id: "senior-qa-specialist",
      label: "Best fit",
      title: "Senior QA Specialist",
      summary: "Own complex quality-system decisions and improve investigation quality.",
      horizon: "9–15 months",
      evidence: "Deviation decisions, CAPA effectiveness, change-control ownership",
      mainGap: "Independent decision evidence across multiple QMS processes",
      fitReason: "Builds directly on QA experience without requiring immediate people management.",
    },
    {
      id: "quality-systems-lead",
      label: "Adjacent",
      title: "Quality Systems Lead",
      summary: "Specialize in QMS governance, metrics, audits, and system improvement.",
      horizon: "12–18 months",
      evidence: "System metrics, governance routines, audit and remediation outcomes",
      mainGap: "Portfolio-level system ownership",
      fitReason: "Fits professionals who prefer system design and cross-functional influence.",
    },
    {
      id: "qa-manager",
      label: "Stretch",
      title: "QA Manager",
      summary: "Lead a QA team and be accountable for site quality execution.",
      horizon: "18–30 months",
      evidence: "People leadership, escalation decisions, inspection readiness",
      mainGap: "Sustained people and decision accountability",
      fitReason: "A viable stretch after leadership evidence and sponsor support are established.",
    },
  ],
  "regulatory-affairs": [
    {
      id: "regulatory-affairs-specialist",
      label: "Best fit",
      title: "Regulatory Affairs Specialist",
      summary: "Own defined submissions, variations, and health-authority responses.",
      horizon: "9–15 months",
      evidence: "Submission sections, variation ownership, response tracking",
      mainGap: "End-to-end ownership of a defined regulatory workstream",
      fitReason: "Turns operational RA experience into defensible submission ownership.",
    },
    {
      id: "cmc-regulatory-associate",
      label: "Adjacent",
      title: "CMC Regulatory Associate",
      summary: "Move closer to manufacturing changes, product quality, and lifecycle strategy.",
      horizon: "12–20 months",
      evidence: "CMC module work, change-impact assessment, technical cross-functional input",
      mainGap: "Technical manufacturing and quality depth",
      fitReason: "A strong adjacent route for professionals who enjoy technical evidence.",
    },
    {
      id: "regulatory-operations-lead",
      label: "Stretch",
      title: "Regulatory Operations Lead",
      summary: "Coordinate submission systems, publishing quality, and delivery governance.",
      horizon: "18–24 months",
      evidence: "Submission governance, system controls, team coordination",
      mainGap: "Operational leadership across multiple submissions",
      fitReason: "A stretch route for candidates with strong organization and system ownership.",
    },
  ],
  "manufacturing-quality": [
    {
      id: "quality-operations-specialist",
      label: "Best fit",
      title: "Quality Operations Specialist",
      summary: "Translate manufacturing experience into stronger quality-floor decisions.",
      horizon: "9–15 months",
      evidence: "Deviation participation, batch decisions, controlled improvement outcomes",
      mainGap: "Documented quality decision ownership",
      fitReason: "Preserves manufacturing context while building a formal quality evidence base.",
    },
    {
      id: "process-validation-specialist",
      label: "Adjacent",
      title: "Process Validation Specialist",
      summary: "Move into protocol-driven lifecycle and process-performance work.",
      horizon: "12–18 months",
      evidence: "Protocol execution, data interpretation, validation reporting",
      mainGap: "Lifecycle validation and statistics depth",
      fitReason: "A technical adjacent route for structured, evidence-oriented professionals.",
    },
    {
      id: "manufacturing-team-lead",
      label: "Stretch",
      title: "Manufacturing Team Lead",
      summary: "Lead people, performance, and controlled execution on the floor.",
      horizon: "15–24 months",
      evidence: "Shift leadership, coaching, performance and deviation outcomes",
      mainGap: "Sustained people-leadership evidence",
      fitReason: "A stretch route with a larger leadership component and operational accountability.",
    },
  ],
  other: [
    {
      id: "quality-specialist",
      label: "Best fit",
      title: "Quality Specialist",
      summary: "Build a regulated-quality foundation around evidence, systems, and decisions.",
      horizon: "12–18 months",
      evidence: "Controlled documentation, investigation support, relevant training evidence",
      mainGap: "Direct regulated-quality experience",
      fitReason: "Creates the clearest bridge into regulated manufacturing quality.",
    },
    {
      id: "compliance-operations-specialist",
      label: "Adjacent",
      title: "Compliance Operations Specialist",
      summary: "Use documentation and coordination strengths in a controlled environment.",
      horizon: "12–20 months",
      evidence: "Process controls, document quality, remediation support",
      mainGap: "Regulated-system context",
      fitReason: "A practical adjacent route when organization and evidence handling are strengths.",
    },
    {
      id: "quality-project-coordinator",
      label: "Stretch",
      title: "Quality Project Coordinator",
      summary: "Coordinate cross-functional quality actions and controlled change.",
      horizon: "15–24 months",
      evidence: "Project delivery, risk tracking, stakeholder coordination",
      mainGap: "Cross-functional project evidence",
      fitReason: "A stretch route that rewards coordination but needs credible project outcomes.",
    },
  ],
};

const targetByTrack: Record<CareerTrack, Record<CompetencyKey, number>> = {
  "qc-microbiology": { technicalExecution: 84, gmpEvidence: 78, investigationOwnership: 76, documentation: 82, leadership: 62, english: 76 },
  "quality-assurance": { technicalExecution: 68, gmpEvidence: 86, investigationOwnership: 84, documentation: 84, leadership: 70, english: 78 },
  "regulatory-affairs": { technicalExecution: 62, gmpEvidence: 78, investigationOwnership: 66, documentation: 90, leadership: 64, english: 86 },
  "manufacturing-quality": { technicalExecution: 78, gmpEvidence: 82, investigationOwnership: 74, documentation: 74, leadership: 72, english: 72 },
  other: { technicalExecution: 65, gmpEvidence: 75, investigationOwnership: 68, documentation: 80, leadership: 62, english: 76 },
};

const recommendationLibrary: Record<CompetencyKey, CareerRecommendation> = {
  technicalExecution: {
    competency: "technicalExecution",
    title: "Convert routine execution into method-ownership evidence",
    rationale: "Senior roles require proof that you can explain controls, limitations, and decisions—not only perform steps.",
    href: "/academy",
    resource: "Atlas Learn: Method fundamentals",
  },
  gmpEvidence: {
    competency: "gmpEvidence",
    title: "Strengthen GMP data-integrity and review habits",
    rationale: "Reviewed, attributable work is more persuasive than an unverified skills list.",
    href: "/blog/data-integrity-in-pharmaceutical-manufacturing",
    resource: "Atlas Learn: Data integrity",
  },
  investigationOwnership: {
    competency: "investigationOwnership",
    title: "Own one investigation from evidence collection to effectiveness check",
    rationale: "End-to-end investigation evidence is usually the clearest gap between execution and senior-level ownership.",
    href: "/library/deviation-management",
    resource: "Atlas Learn: Deviation management",
  },
  documentation: {
    competency: "documentation",
    title: "Build a reviewed technical-writing sample",
    rationale: "A controlled SOP, protocol, or report demonstrates thinking quality and traceability.",
    href: "/library/good-documentation-practice",
    resource: "Atlas Learn: Good documentation practice",
  },
  leadership: {
    competency: "leadership",
    title: "Lead a bounded improvement with a measurable outcome",
    rationale: "Leadership evidence can start with ownership, coaching, and follow-through before a formal title change.",
    href: "/workflows",
    resource: "Atlas Workflows: Quality improvement",
  },
  english: {
    competency: "english",
    title: "Practice technical explanations for high-stakes conversations",
    rationale: "Clear explanations improve audit, interview, and cross-functional credibility.",
    href: "/blog/qc-qa-interview-toughest-questions",
    resource: "Atlas Guide: QC/QA interview practice",
  },
};

function clamp(value: number) {
  return Math.max(20, Math.min(96, Math.round(value)));
}

function englishScore(level: CareerProfile["englishLevel"]) {
  return { basic: 42, intermediate: 60, "upper-intermediate": 76, advanced: 90 }[level];
}

function buildCareerAnalysisLegacy(profile: CareerProfile, selectedRouteId?: string) {
  const current: Record<CompetencyKey, number> = {
    technicalExecution: clamp(profile.ratings.technicalExecution * 15 + profile.methods.length * 4),
    gmpEvidence: clamp(profile.ratings.gmpEvidence * 15 + profile.qualityActivities.length * 4),
    investigationOwnership: clamp(
      profile.ratings.investigationOwnership * 15 +
        profile.qualityActivities.filter((activity) => /deviation|oos|oot|capa|investigation/i.test(activity)).length * 5,
    ),
    documentation: clamp(profile.ratings.documentation * 15 + profile.evidenceActivities.length * 4),
    leadership: clamp(
      profile.ratings.leadership * 16 +
        profile.evidenceActivities.filter((activity) => /mentor|train|lead|project/i.test(activity)).length * 7,
    ),
    english: englishScore(profile.englishLevel),
  };

  const target = targetByTrack[profile.careerTrack];
  const competencies = competencyKeys.map((key) => ({ key, label: labels[key], current: current[key], target: target[key] }));
  const routes = routeSets[profile.careerTrack];
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];
  const ranked = [...competencies].sort((a, b) => b.target - b.current - (a.target - a.current));
  const strongest = [...competencies].sort((a, b) => b.current - a.current).slice(0, 3).map((item) => item.label);

  return {
    routes,
    selectedRoute,
    competencies,
    recommendations: ranked.slice(0, 3).map((item) => recommendationLibrary[item.key]),
    milestones: [
      { months: "Months 1–3", title: "Evidence baseline", outcome: "Inventory current proof, confirm priority gaps, and secure one reviewer or sponsor." },
      { months: "Months 4–6", title: "Own an investigation", outcome: "Complete one bounded quality decision with a reviewed effectiveness check." },
      { months: "Months 7–9", title: "Lead a controlled improvement", outcome: "Deliver a measurable method, process, documentation, or team improvement." },
      { months: "Months 10–12", title: "Prepare role transition", outcome: "Translate evidence into a targeted CV, story bank, and internal or external search plan." },
    ],
    strongestAssets: strongest,
    biggestGap: ranked[0].label,
    assumptions: [
      "Self-ratings and evidence have not been independently verified.",
      "Target-role expectations vary by employer, site, product scope, and authorization.",
      "Local compensation and hiring-market conditions require current external validation.",
    ],
  };
}

const preferenceKeywords: Record<CareerProfile["workPreference"], RegExp> = {
  "technical-specialist": /specialist|microbiologist|validation|technical|cmc/i,
  "quality-systems": /quality systems|investigation|compliance|regulatory/i,
  "people-leadership": /lead|manager/i,
  "cross-functional": /operations|project|regulatory|quality specialist/i,
};

const constraintLabels: Record<CareerProfile["primaryConstraint"], string> = {
  "limited-ownership": "limited access to visible ownership opportunities",
  time: "limited weekly development time",
  english: "technical English confidence",
  experience: "insufficient role-relevant experience",
  "manager-support": "uncertain manager or sponsor support",
  location: "location and mobility constraints",
  "unclear-direction": "an unclear target direction",
};

function phaseRanges(horizon: CareerProfile["targetHorizonMonths"]) {
  const boundaries = horizon === 6 ? [2, 3, 5, 6] : horizon === 12 ? [3, 6, 9, 12] : horizon === 18 ? [4, 9, 14, 18] : [6, 12, 18, 24];
  let start = 1;
  return boundaries.map((end) => {
    const label = start === end ? `Month ${end}` : `Months ${start}-${end}`;
    start = end + 1;
    return label;
  });
}

export function buildCareerAnalysis(profile: CareerProfile, selectedRouteId?: string): CareerAnalysis {
  const baseline = buildCareerAnalysisLegacy(profile, selectedRouteId);
  const currentByKey = Object.fromEntries(baseline.competencies.map((item) => [item.key, item.current])) as Record<CompetencyKey, number>;
  const evidenceCount = profile.methods.length + profile.qualityActivities.length + profile.evidenceActivities.length;
  const routeTarget = profile.targetRole.trim().toLowerCase();
  const routes = baseline.routes.map((route, index) => {
    const title = route.title.toLowerCase();
    const titleMatch = routeTarget && (title.includes(routeTarget) || routeTarget.includes(title)) ? 8 : 0;
    const preferenceMatch = preferenceKeywords[profile.workPreference].test(route.title) ? 7 : 0;
    const leadershipPenalty = /lead|manager/i.test(route.title) && currentByKey.leadership < 60 ? 8 : 0;
    const internalPenalty = profile.transitionMode === "internal" && index > 0 ? 3 : 0;
    const fitScore = clamp(74 - index * 8 + titleMatch + preferenceMatch + Math.min(6, Math.floor(evidenceCount / 3)) - leadershipPenalty - internalPenalty);
    return {
      ...route,
      fitScore,
      readinessLabel: fitScore >= 78 ? "Build now" as const : fitScore >= 66 ? "Validate first" as const : "Longer-term bet" as const,
      whyNow: [
        `${profile.yearsExperience} years in ${profile.sector} provides the starting context.`,
        `${profile.workPreference.replace(/-/g, " ")} work ${preferenceMatch ? "matches the role's emphasis" : "matches part of the role and needs validation"}.`,
      ],
      risks: [route.mainGap, constraintLabels[profile.primaryConstraint]],
    };
  });
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0];
  const ranked = [...baseline.competencies].sort((a, b) => b.target - b.current - (a.target - a.current));
  const recommendations = ranked.slice(0, 3).map((item, index) => ({
    ...recommendationLibrary[item.key],
    firstAction: index === 0
      ? `Within seven days, ask a qualified reviewer to define one bounded ${item.label.toLowerCase()} outcome relevant to ${selectedRoute.title}.`
      : `Schedule one ${item.label.toLowerCase()} practice block and record the evidence boundary before starting.`,
    proof: `A sanitized artifact or outcome note, reviewer feedback, and one explicit lesson tied to ${selectedRoute.title}.`,
    effortHours: Math.max(2, Math.round(profile.weeklyHours * (index === 0 ? 1.5 : 1))),
  }));
  const ranges = phaseRanges(profile.targetHorizonMonths);
  const readinessIndex = Math.round(baseline.competencies.reduce((sum, item) => sum + Math.min(100, (item.current / item.target) * 100), 0) / baseline.competencies.length);
  const confidencePoints = [profile.proudAchievement.trim(), profile.targetRole.trim(), evidenceCount >= 5 ? "evidence" : "", profile.managerSupport === "yes" ? "support" : ""].filter(Boolean).length;
  const decisionConfidence: CareerAnalysis["decisionConfidence"] = confidencePoints >= 3 ? "Strong direction" : confidencePoints >= 1 ? "Directional" : "Exploratory";
  const practiceContext = profile.methods[0] ?? profile.qualityActivities[0] ?? "a current quality responsibility";

  return {
    ...baseline,
    routes,
    selectedRoute,
    recommendations,
    milestones: [
      {
        months: ranges[0],
        title: "Validate the route",
        outcome: `Test ${selectedRoute.title} against real role requirements and establish a defensible evidence baseline.`,
        actions: ["Review 5-8 real role descriptions or one internal role profile.", "Map each requirement to evidence, a gap, or an unknown.", profile.managerSupport === "yes" ? "Agree one development outcome with your manager or sponsor." : "Identify one qualified reviewer or mentor."],
        evidence: ["Completed role scorecard", "Named reviewer", "Top-three gap baseline"],
        successMetric: "At least 70% of target-role requirements are classified as evidence, gap, or unknown.",
      },
      {
        months: ranges[1],
        title: recommendations[0].title,
        outcome: `Close the highest-priority gap: ${ranked[0].label}.`,
        actions: [recommendations[0].firstAction!, `Use ${practiceContext} as the practice context.`, "Capture reviewer feedback and revise once."],
        evidence: [recommendations[0].proof!, "Before/after reflection"],
        successMetric: "One reviewed proof point demonstrates a decision or outcome, not only participation.",
      },
      {
        months: ranges[2],
        title: "Prove ownership in context",
        outcome: `Apply the new capability through one visible, bounded outcome relevant to ${selectedRoute.title}.`,
        actions: [recommendations[1].title, profile.proudAchievement ? `Build from the pattern in your stated achievement: ${profile.proudAchievement}` : "Choose a project with a clear owner, boundary, and observable result.", "Ask the reviewer to challenge the strength of your claim."],
        evidence: ["Sanitized outcome narrative", "Reviewer challenge log", "One measurable or observable result"],
        successMetric: "A reviewer agrees that your contribution and the outcome are stated accurately.",
      },
      {
        months: ranges[3],
        title: "Run the transition decision",
        outcome: `Convert evidence into a targeted ${profile.transitionMode === "internal" ? "internal" : profile.transitionMode === "external" ? "external" : "internal/external"} transition campaign.`,
        actions: ["Update CV and LinkedIn evidence statements.", "Prepare six role-specific interview stories.", "Run three market conversations or one formal internal career review.", "Keep, adjust, or stop the route using the decision scorecard."],
        evidence: ["Targeted CV", "Six-story bank", "Application or internal-conversation tracker"],
        successMetric: "Three real market or sponsor signals confirm whether to continue, adjust, or choose an adjacent route.",
      },
    ],
    assumptions: [...baseline.assumptions, `The stated primary constraint is ${constraintLabels[profile.primaryConstraint]}; its actual impact has not been independently tested.`],
    readinessIndex,
    decisionConfidence,
    confidenceReasons: [
      `${evidenceCount} selected evidence signals inform the baseline.`,
      profile.targetRole ? `The stated target role is ${profile.targetRole}.` : "No exact target-role title was supplied, so role fit remains broad.",
      profile.proudAchievement ? "A concrete achievement was supplied and can anchor proof-building." : "No concrete achievement was supplied; add one before applying.",
      profile.managerSupport === "yes" ? "Manager or sponsor support is available." : `Manager or sponsor support is ${profile.managerSupport}.`,
    ],
  };
}

export function careerProfileFilename(profile: CareerProfile) {
  const safeName = profile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "personal";
  return `${safeName}-career-blueprint.pdf`;
}
