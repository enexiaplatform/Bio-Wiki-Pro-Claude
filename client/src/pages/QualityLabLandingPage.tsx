import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FileOutput,
  FlaskConical,
  Gauge,
  Layers3,
  Microscope,
  Network,
  ShieldCheck,
  Users,
  Download,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { SITE_URL } from "@/lib/site";
import { analytics } from "@/hooks/use-analytics";

const steps = [
  { icon: Boxes, label: "Product portfolio", detail: "Products, raw materials, batches and markets" },
  { icon: ClipboardList, label: "Testing demand", detail: "Samples, methods, frequency and turnaround" },
  { icon: Network, label: "Capability architecture", detail: "Workflows, equipment, people and space" },
  { icon: FileOutput, label: "Operating blueprint", detail: "CAPEX/OPEX, risks, phases and assumptions" },
];

const outputs = [
  { icon: Microscope, title: "Capability map", body: "See the microbiology workflows the lab must own, outsource or phase in." },
  { icon: Gauge, title: "Workload & capacity", body: "Translate samples into hands-on hours, incubation demand and future headroom." },
  { icon: Users, title: "Staffing model", body: "Estimate analyst and reviewer capacity with explicit productivity and resilience assumptions." },
  { icon: Building2, title: "Space concept", body: "Create a planning allowance for receipt, media, testing, incubation, storage and support flows." },
  { icon: Calculator, title: "CAPEX & OPEX bands", body: "Build vendor-neutral budget ranges for equipment, consumables, maintenance and staffing." },
  { icon: ShieldCheck, title: "Decision traceability", body: "Keep every rule, assumption, confidence level and SME review point visible." },
];

const boundaries = [
  "Concept planning — not detailed architectural, HVAC or utility design",
  "Vendor-neutral equipment requirements — not a supplier quotation",
  "Regulatory mapping support — not registration or legal advice",
  "Human-reviewed decisions — not autonomous batch or compliance decisions",
];

const evidenceGuides = [
  {
    eyebrow: "Compiler Core",
    title: "Build a cross-domain QC capability map",
    body: "Connect quality decisions, requirements, methods, resources, partners and governance before selecting equipment.",
    href: "/blog/product-portfolio-to-qc-capability-map",
  },
  {
    eyebrow: "First Domain Pack",
    title: "Scope non-sterile microbiology before design freeze",
    body: "Turn product and market inputs into method architecture, physical workload, capacity and explicit review blockers.",
    href: "/blog/how-to-scope-nonsterile-microbiology-qc-lab",
  },
  {
    eyebrow: "Evidence-development area",
    title: "Plan water and environmental monitoring capability",
    body: "Translate points, frequencies and events into sampling, method, incubation, trending, investigation and resilience demand.",
    href: "/blog/water-environmental-monitoring-capability-planning",
  },
  {
    eyebrow: "Specialist-gated area",
    title: "Plan sterile and biologics quality capability",
    body: "Connect sterility-assurance evidence, product attributes, specialist methods, critical reagents, capacity and lifecycle decisions.",
    href: "/blog/sterile-biologics-qc-capability-planning",
  },
  {
    eyebrow: "SME-gated area",
    title: "Plan analytical chemistry from method architecture",
    body: "Translate preparations, sequences, standards and review into instrument, analyst, consumable and lifecycle capacity.",
    href: "/blog/analytical-chemistry-qc-capability-planning",
  },
  {
    eyebrow: "Evidence-development area",
    title: "Plan stability and sample-management capability",
    body: "Forecast protocol inventory, chamber geometry, pull calendars, method workload, trending and continuity across time.",
    href: "/blog/stability-sample-management-capability-planning",
  },
  {
    eyebrow: "Learning governance",
    title: "Validate rules without turning one project into a benchmark",
    body: "Separate synthetic cases, project calibration, learning candidates and controlled Domain Pack rule changes.",
    href: "/blog/how-to-validate-a-quality-lab-domain-pack",
  },
  {
    eyebrow: "Method Graph deep dive",
    title: "Connect method suitability to BOM and laboratory capacity",
    body: "See how product inhibition, neutralization, recovery and filtration choices change consumables, analyst work and incubation load.",
    href: "/blog/method-suitability-to-microbiology-lab-capacity",
  },
  {
    eyebrow: "Compiler Core deep dive",
    title: "Turn workload into usable equipment capacity",
    body: "Model natural occupancy units, qualified geometry, peaks, downtime, queue risk, redundancy and measurable procurement triggers.",
    href: "/blog/from-workload-to-usable-qc-equipment-capacity",
  },
  {
    eyebrow: "Compiler Core deep dive",
    title: "Build resilient staffing beyond aggregate FTE",
    body: "Convert hands-on work into analyst, reviewer and specialist capacity using productive hours, skill coverage, shifts, peaks and resilience triggers.",
    href: "/blog/from-hands-on-hours-to-resilient-qc-staffing",
  },
  {
    eyebrow: "Compiler Core deep dive",
    title: "Turn method BOM into a resilient supply plan",
    body: "Separate net and gross demand, then expose reorder points, safety stock, expiry, storage and supplier-continuity evidence.",
    href: "/blog/from-method-bom-to-resilient-qc-consumable-supply",
  },
  {
    eyebrow: "Compiler Core deep dive",
    title: "Create an engineering-ready space and flow basis",
    body: "Translate activities into zones, adjacencies, segregation, personnel/sample/material/waste flows, equipment envelopes and utility evidence.",
    href: "/blog/from-qc-capability-map-to-space-zoning-and-flow-basis",
  },
];

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07 } }),
};

export default function QualityLabLandingPage() {
  useSEO({
    title: "Atlas Quality Lab Blueprint",
    description: "Turn product portfolio, production demand and microbiology testing scope into a vendor-neutral QC laboratory operating blueprint.",
    canonical: `${SITE_URL}/quality-lab`,
    ogImage: `${SITE_URL}/quality-lab-og.png`,
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <section className="relative isolate border-b border-white/10 px-4 py-14 md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.12),transparent_28%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div>
            <motion.div variants={fade} initial="hidden" animate="show" custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200">
                <FlaskConical className="h-3.5 w-3.5" /> Microbiology domain pack · Concept edition
              </span>
            </motion.div>
            <motion.h1 variants={fade} initial="hidden" animate="show" custom={1} className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.04] md:text-6xl">
              From product portfolio to a <span className="text-teal-300">defensible QC lab blueprint.</span>
            </motion.h1>
            <motion.p variants={fade} initial="hidden" animate="show" custom={2} className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Atlas converts production demand and microbiology scope into workload, equipment, people, space, cost and procurement decisions — with every assumption visible.
            </motion.p>
            <motion.div variants={fade} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/quality-lab/planner" onClick={() => analytics.blueprintCtaClicked("quality_lab_hero", "planner")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-teal-500/20 transition hover:-translate-y-0.5 hover:bg-teal-200">
                Build a blueprint <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/projects" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10">
                Open saved projects
              </Link>
            </motion.div>
            <motion.div variants={fade} initial="hidden" animate="show" custom={4} className="mt-8 grid max-w-2xl gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {["Vendor-neutral", "Scenario-based", "SME review-ready"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-300" /> {item}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={fade} initial="hidden" animate="show" custom={2} className="relative">
            <div className="absolute -inset-8 -z-10 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-slate-950/75 p-5 shadow-2xl shadow-black/40 backdrop-blur md:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Sample scenario</p>
                  <p className="mt-1 font-display text-lg font-bold">Non-sterile pharma expansion</p>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">Concept</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5">
                {[
                  ["40", "Finished products"], ["30/mo", "Production batches"], ["70%", "Three-year growth"], ["EU + VN", "Target markets"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-2xl font-bold text-teal-200">{value}</p>
                    <p className="mt-1 text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  ["Workload model", "Samples → hands-on hours"],
                  ["Capacity model", "Hours → people & equipment"],
                  ["Commercial model", "Resources → CAPEX/OPEX"],
                ].map(([title, detail], index) => (
                  <div key={title} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-300/10 text-sm font-bold text-teal-200">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-slate-400">{detail}</p>
                    </div>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-teal-300" style={{ width: `${76 + index * 9}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950/35 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Requirements-to-blueprint</p>
            <h2 className="mt-3 text-3xl font-bold">Start before layout, LIMS and scheduling.</h2>
            <p className="mt-3 leading-7 text-slate-400">Define what the laboratory must be capable of before deciding where equipment goes or which vendor should supply it.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.label} className="relative rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10 text-teal-200"><step.icon className="h-5 w-5" /></div>
                  <span className="text-xs font-bold text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="text-base font-bold">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
                {index < steps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 text-teal-300 md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">One operating model</p>
            <h2 className="mt-3 text-3xl font-bold">A blueprint teams can challenge, refine and approve.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {outputs.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-teal-300/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200"><item.icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/35 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Atlas Evidence</p>
              <h2 className="mt-3 text-3xl font-bold">Understand the reasoning before using the estimate.</h2>
              <p className="mt-3 leading-7 text-slate-400">These guides expose the decision chain behind the Compiler and show where product facts, evidence and qualified review still control the answer.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Link href="/quality-lab/discovery-pack" onClick={() => analytics.blueprintCtaClicked("quality_lab_evidence", "discovery_pack")} className="inline-flex items-center gap-2 rounded-xl border border-teal-300/25 bg-teal-300/10 px-4 py-2.5 text-sm font-bold text-teal-200 transition hover:bg-teal-300/15">
                <Download className="h-4 w-4" /> Free discovery pack
              </Link>
              <Link href="/quality-lab/casebook" onClick={() => analytics.blueprintCtaClicked("quality_lab_evidence", "casebook")} className="inline-flex items-center gap-2 text-sm font-bold text-sky-300 transition hover:text-sky-200">
                Explore engine-calculated cases <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/evidence" onClick={() => analytics.blueprintCtaClicked("quality_lab_evidence", "evidence_graph")} className="inline-flex items-center gap-2 text-sm font-bold text-sky-300 transition hover:text-sky-200">
                Navigate the Evidence Graph <Network className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/domain-readiness" className="inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-amber-200">
                Review expansion gates <ShieldCheck className="h-4 w-4" />
              </Link>
              <Link href="/blog?category=Quality+Lab+Planning" className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition hover:text-teal-200">
                Explore planning evidence <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {evidenceGuides.map((guide) => (
              <Link key={guide.href} href={guide.href} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-sky-300/30 hover:bg-white/[0.055]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">{guide.eyebrow}</p>
                <h3 className="mt-3 text-lg font-bold transition group-hover:text-teal-200">{guide.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{guide.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-teal-300">Read the guide <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/45 px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Strict product boundary</p>
            <h2 className="mt-3 text-3xl font-bold">Planning intelligence, not engineering theatre.</h2>
            <p className="mt-4 leading-7 text-slate-400">Atlas makes the basis of design explicit and hands qualified specialists a better starting point.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {boundaries.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-300">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-300/15 via-sky-300/5 to-transparent p-7 shadow-2xl shadow-teal-950/25 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300 text-slate-950"><Layers3 className="h-5 w-5" /></div>
              <h2 className="mt-6 text-3xl font-bold">Compile your first microbiology blueprint.</h2>
              <p className="mt-3 leading-7 text-slate-300">Use the concept engine now, then review the assumptions with QC, QA, engineering and procurement before making investment decisions.</p>
            </div>
              <div className="flex shrink-0 flex-col gap-3">
              <Link href="/quality-lab/planner" onClick={() => analytics.blueprintCtaClicked("quality_lab_final", "planner")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200">
                Start a project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quality-lab/review" onClick={() => analytics.blueprintCtaClicked("quality_lab_final", "expert_review")} className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/10">Discuss a real lab project</Link>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
