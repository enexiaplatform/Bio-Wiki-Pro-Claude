import { Link } from "wouter";
import { BookOpen, Package, ShieldCheck, Globe, Target, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

const values = [
  { icon: ShieldCheck, title: "Practitioner-grade", desc: "Frameworks teams actually use during audits — aligned with GMP WHO, EU GMP Annex 1, and ICH." },
  { icon: Target, title: "No empty theory", desc: "Every lesson ties to a real decision: an excursion, a finding, an interview question." },
  { icon: Globe, title: "Built for a global audience", desc: "English-first content for QC/QA professionals in Pharma, Biotech, and F&B worldwide." },
];

const audience = [
  "Senior QC/QA professionals aiming for Supervisor/Manager",
  "Teams preparing for a GMP or Annex 1 audit",
  "Microbiologists strengthening sterility, EM, and investigation skills",
  "Anyone who wants a systematic, audit-ready mental model",
];

export default function About() {
  useSEO({
    title: "About BioWikiPro",
    description: "BioWikiPro is a QC/QA Pharma knowledge platform — practitioner-grade GMP lessons, audit tools, and a career roadmap for a global audience.",
  });

  return (
    <div className="pb-24 pt-8 md:pt-12 max-w-3xl mx-auto px-4">
      <JsonLd
        id="about-org"
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "BioWikiPro",
          url: SITE_URL,
          description: "QC/QA Pharma knowledge platform — GMP lessons, audit tools, and career roadmap.",
          knowsAbout: ["GMP", "Quality Control", "Quality Assurance", "Pharmaceutical Microbiology", "Annex 1", "Data Integrity"],
        }}
      />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">About BioWikiPro</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A QC/QA Pharma knowledge platform that turns scattered GMP know-how into a
          systematic, audit-ready skill set.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Our mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          Most QC/QA knowledge lives in scattered SOPs, tribal memory, and the heads of a
          few senior people. BioWikiPro makes it learnable: in-depth lessons, decision
          tools, and audit-prep resources — so professionals can grow from Senior QC to
          QA Manager with a clear, defensible mental model.
        </p>
      </section>

      {/* Values */}
      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border border-white/5 bg-card p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <v.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">{v.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* Who it's for */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Who it's for</h2>
        <ul className="space-y-2.5">
          {audience.map((a) => (
            <li key={a} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Credibility */}
      <section className="mb-12 rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="text-xl font-bold mb-3">Written from both sides of the bench</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          BioWikiPro is built by practitioners who work directly with the QC labs of
          Pharma & F&B manufacturers — Industrial Microbiology specialists who see what
          teams actually need when an inspection is coming. The content is reviewed against
          current standards (GMP WHO 2023, EU GMP Annex 1 2022, USP/EP, ICH) and written to
          be applied, not just read.
        </p>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/academy" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 font-semibold px-6 py-3 rounded-xl transition-all">
          <BookOpen className="w-4 h-4" /> Explore the Academy
        </Link>
        <Link href="/toolkits/gmp-audit-kit" className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-6 py-3 rounded-xl transition-all">
          <Package className="w-4 h-4" /> GMP Audit Kit
        </Link>
      </div>
    </div>
  );
}
