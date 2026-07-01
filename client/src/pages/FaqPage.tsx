import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, HelpCircle, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useSEO } from "@/hooks/use-seo";
import { JsonLd } from "@/components/JsonLd";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Who is Life Science Atlas for?",
    a: "QC and QA professionals in pharma, biotech, and life sciences — from analysts and microbiologists to quality managers. The content assumes a working GMP context and focuses on the topics that come up in real labs and inspections.",
  },
  {
    q: "What's the difference between Free and Pro?",
    a: "Free gives you the core lessons, learning paths, quizzes, the glossary, and the blog. Pro unlocks the in-depth lessons (decision trees, templates, and worked examples), every new Pro lesson we publish, and the full library across data integrity, validation, sterility, and quality systems.",
  },
  {
    q: "How current is the content?",
    a: "Lessons reference current standards (EU GMP Annex 1:2022, ICH Q-series, USP/EP chapters, FDA guidance) and carry an updated date. We revise content as guidance changes — for example, the shift from 10 ppm cleaning limits to health-based exposure limits.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — new Pro subscribers get a 7-day free trial. You won't be charged until the trial ends, and you can cancel anytime before then from the Stripe customer portal (Settings → Manage subscription) at no cost.",
  },
  {
    q: "What are the downloadable kits?",
    a: "Alongside the subscription we sell one-time toolkits — the GMP Audit Survival Kit, Career Starter Kit, and Interview Prep Pack (or the bundle). Each is a set of ready-to-use deliverables (audit checklists, SOP gap analyses, CAPA templates, interview Q&A, CV and cover-letter templates) delivered as PDF and Excel files you download from your account after purchase.",
  },
  {
    q: "How do payments work — is it secure?",
    a: "All payments are processed by Stripe; we never see or store your card details. Subscriptions are billed monthly and one-time kits are a single charge. You'll get an email receipt and, for kits, immediate access to the downloads in your account.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Pro is a subscription you manage yourself through the Stripe customer portal (Settings → Manage subscription). Cancel anytime; your access continues until the end of the period you've paid for.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes — completing any learning path unlocks a printable Certificate of Completion you can download as a PDF or image and share on LinkedIn.",
  },
  {
    q: "Is this a substitute for official training or SOPs?",
    a: "No. Life Science Atlas is an educational reference to build understanding and prepare for audits. It does not replace your site's validated procedures, official GMP training, or regulatory advice.",
  },
  {
    q: "Do you offer team or enterprise plans?",
    a: "Get in touch via the Solutions page for team access and volume pricing.",
  },
];

export default function FaqPage() {
  useSEO({
    title: "FAQ",
    description: "Frequently asked questions about Life Science Atlas — who it's for, Free vs Pro, how current the content is, the free trial, cancellation, and certificates.",
  });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-2xl mx-auto px-4">
      <JsonLd
        id="faq-page"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary">Life Science Atlas</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">FAQ</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Frequently asked questions</h1>
      </div>

      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-2xl border border-white/10 bg-card overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm">{f.q}</span>
                <ChevronDown className={clsx("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 -mt-1 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-6 text-center">
        <p className="font-bold mb-1">Still have a question?</p>
        <p className="text-sm text-muted-foreground mb-4">
          We're happy to help — or jump straight into the library.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            See pricing
          </Link>
          <Link href="/academy" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold hover:border-white/30 transition-colors">
            Browse the Academy
          </Link>
        </div>
      </div>
    </div>
  );
}
