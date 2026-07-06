import { Link } from "wouter";
import { BookOpen, CheckCircle2, Globe, Package, ShieldCheck, Target } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

const values = [
  { icon: ShieldCheck, title: "Practitioner-grade", desc: "Frameworks teams actually use during audits, aligned with GMP, EU GMP Annex 1, and ICH." },
  { icon: Target, title: "No empty theory", desc: "Every lesson ties to a real decision: an excursion, a finding, a release question, or an interview answer." },
  { icon: Globe, title: "Built for a global audience", desc: "English-first content for QC/QA professionals in Pharma, Biotech, and F&B worldwide." },
];

const audience = [
  "Senior QC/QA professionals aiming for Supervisor or Manager",
  "Teams preparing for a GMP, data-integrity, or Annex 1 audit",
  "Microbiologists strengthening sterility, EM, and investigation skills",
  "Anyone who wants a systematic, audit-ready mental model",
];

const proofPoints = [
  { value: "159", label: "Content entries" },
  { value: "QC/QA", label: "Core audience" },
  { value: "GMP", label: "Evidence-led" },
];

const cardClass = "rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10";

export default function About() {
  useSEO({
    title: "About Life Science Atlas",
    description: "Life Science Atlas is a QC/QA Pharma knowledge platform: practitioner-grade GMP lessons, audit tools, and a career roadmap for a global audience.",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id="about-org"
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Life Science Atlas",
          url: SITE_URL,
          description: "QC/QA Pharma knowledge platform: GMP lessons, audit tools, and career roadmap.",
          knowsAbout: ["GMP", "Quality Control", "Quality Assurance", "Pharmaceutical Microbiology", "Annex 1", "Data Integrity"],
        }}
      />

      <section className="mb-8 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              About Life Science Atlas
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              Practical QC/QA knowledge for people who need defensible decisions.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Life Science Atlas turns scattered GMP know-how into workflows, lessons, tools, and audit-ready mental models.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {proofPoints.map((point) => (
              <div key={point.label} className="rounded-lg border border-white/10 bg-background/35 p-4">
                <p className="text-2xl font-bold text-teal-200">{point.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className={cardClass}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-200">
              <value.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Mission</p>
          <h2 className="mt-2 text-2xl font-bold">Make senior QC/QA thinking learnable.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Most quality knowledge lives in SOPs, tribal memory, and a few senior people. Life Science Atlas makes it easier to learn: in-depth lessons, decision tools, and audit-prep resources so professionals can grow with a clear, defensible mental model.
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Who it is for</p>
          <ul className="mt-4 space-y-3">
            {audience.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Credibility</p>
        <h2 className="mt-2 text-2xl font-bold">Written from both sides of the bench</h2>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          Life Science Atlas is built by practitioners who work directly with QC labs and quality teams. The content is reviewed against current standards such as GMP WHO 2023, EU GMP Annex 1 2022, USP/EP, and ICH, and written to be applied rather than just read.
        </p>
      </section>

      <section className="rounded-lg border border-teal-400/25 bg-teal-400/10 p-5 shadow-lg shadow-black/10 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Start with the practical surface.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Browse lessons for context, or use a toolkit when you need a working document.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/academy" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/30">
              <BookOpen className="h-4 w-4" />
              Explore Academy
            </Link>
            <Link href="/toolkits/gmp-audit-kit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300">
              <Package className="h-4 w-4" />
              GMP Audit Kit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
