import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, Factory, FileSearch, ShieldCheck } from "lucide-react";
import { EditorialImage } from "@/components/EditorialImage";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

const proofPoints = [
  {
    icon: Factory,
    title: "Blueprint-first workspace",
    text: "Start with the laboratory planning decision, then open evidence when it helps challenge the model.",
  },
  {
    icon: ShieldCheck,
    title: "Private account access",
    text: "Keep Pro access, downloads, learning progress, and reviewed-project records connected to your account.",
  },
  {
    icon: FileSearch,
    title: "Evidence-aware by design",
    text: "Assumptions, unresolved inputs, and expert-review boundaries remain visible as you work.",
  },
];

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center gap-6 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] md:py-12">
      <section className="order-2 rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 md:order-1 md:p-7">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300 hover:text-teal-200">
          Life Science Atlas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <div className="mb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <EditorialImage
          src="/images/editorial/researcher-sample-preparation.jpg"
          alt="Laboratory researcher preparing biological samples at a controlled workbench"
          creditName="National Cancer Institute / Daniel Sone"
          creditUrl="https://unsplash.com/photos/1fvqUP-xaYQ"
          className="mb-4 h-36 rounded-lg border border-white/10 sm:h-44"
          imageClassName="object-[center_46%] saturate-75"
          eager
        />

        <div className="grid gap-3">
          {proofPoints.map((point) => (
            <div key={point.title} className="flex gap-3 rounded-lg border border-white/10 bg-background/35 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
                <point.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{point.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="order-1 rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-5 shadow-xl shadow-black/15 md:order-2 md:p-7">
        <div className="rounded-lg border border-white/10 bg-background/75 p-5 shadow-lg shadow-black/10 backdrop-blur md:p-6">
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
      </section>
    </main>
  );
}
