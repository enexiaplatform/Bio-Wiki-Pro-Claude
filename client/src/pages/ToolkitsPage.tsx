import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Filter,
  Lock,
  Package,
  Search,
  Sparkles,
} from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { analytics } from "@/hooks/use-analytics";
import { useSEO } from "@/hooks/use-seo";
import { useUser } from "@/context/UserContext";
import { toolkits } from "@/data/toolkits";
import { EditorialImage } from "@/components/EditorialImage";

const PLACEMENT = "toolkits_index";
const all = "All";

export default function ToolkitsPage() {
  useSEO({
    title: "Toolkits - checklists & templates for QC/QA",
    description:
      "Workflow checklists, templates, and downloadable toolkits for QC/QA and life-science teams. Unlock every toolkit with Pro.",
  });

  const [, navigate] = useLocation();
  const { isPro } = useUser();
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState(all);
  const [access, setAccess] = useState(all);

  function handleUnlock() {
    analytics.upgradePromptClicked(PLACEMENT);
    navigate("/pricing");
  }

  const availableCount = toolkits.filter((toolkit) => toolkit.status === "available").length;
  const formatOptions = useMemo(() => [all, ...Array.from(new Set(toolkits.map((toolkit) => toolkit.format)))], []);
  const accessOptions = useMemo(() => [all, ...Array.from(new Set(toolkits.map((toolkit) => toolkit.accessTier)))], []);

  const filteredToolkits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return toolkits.filter((toolkit) => {
      const queryMatch =
        !normalizedQuery ||
        [toolkit.title, toolkit.audience, toolkit.problemSolved, toolkit.format]
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      const formatMatch = format === all || toolkit.format === format;
      const accessMatch = access === all || toolkit.accessTier === access;
      return queryMatch && formatMatch && accessMatch;
    });
  }, [access, format, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <JsonLd
        id="toolkits-collection"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "QC/QA Toolkits",
          description: "Workflow checklists, templates, and downloadable toolkits for QC/QA professionals.",
        }}
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mb-6 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-teal-400/10 via-white/[0.04] to-transparent p-5 shadow-xl shadow-black/10 md:p-7"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.1),transparent_28%)]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-stretch">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300">
              <Package className="h-3.5 w-3.5" />
              Toolkit Library
            </span>
            <h1 className="mb-3 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              Checklists & toolkits you actually use
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              In-app workflow assets, not lead magnets. Download checklists, templates, and guides
              that map to the workflows you run. Pro unlocks every toolkit.
            </p>
          </div>

          <div className="relative min-h-44 overflow-hidden rounded-lg border border-white/10">
            <EditorialImage src="/images/editorial/cleanroom-practice.jpg" alt="Controlled laboratory practice supported by checklists and templates" creditName="Toon Lambrechts" creditUrl="https://unsplash.com/photos/RkG7wp75b48" eager className="absolute inset-0" imageClassName="object-[center_48%] opacity-65 saturate-75" />
            <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/80 p-3 backdrop-blur">
            <div>
              <div className="text-xl font-bold text-teal-300">{toolkits.length}</div>
              <div className="text-[11px] text-muted-foreground">Toolkits</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">{availableCount}</div>
              <div className="text-[11px] text-muted-foreground">Ready</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-300">Pro</div>
              <div className="text-[11px] text-muted-foreground">Unlocks</div>
            </div>
            </div>
          </div>
        </div>
      </motion.section>

      {!isPro && (
        <section className="mb-6 rounded-lg border border-teal-400/20 bg-gradient-to-r from-teal-400/10 via-emerald-400/5 to-transparent p-5 shadow-lg shadow-black/10 md:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="mb-0.5 text-sm font-semibold">Pro unlocks all {availableCount} downloadable toolkits</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The GMP Audit Survival Kit plus workflow checklists, templates, and guides - $8/mo, cancel anytime.
                </p>
              </div>
            </div>
            <button
              onClick={handleUnlock}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-all hover:-translate-y-0.5 hover:bg-teal-300"
            >
              View Pro <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      <section className="mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by toolkit, audience, or task"
            className="h-11 w-full rounded-lg border border-white/10 bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
            aria-label="Search toolkits"
          />
        </div>
        <FilterChips label="Format" values={formatOptions} active={format} onChange={setFormat} />
        <FilterChips label="Access" values={accessOptions} active={access} onChange={setAccess} labelFor={(value) => value === all ? all : value === "pro" ? "Pro" : "Free"} />
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
            <Sparkles className="h-3.5 w-3.5" />
            Downloadable assets
          </p>
          <h2 className="mt-1 text-xl font-bold">Toolkits</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredToolkits.length} of {toolkits.length}
        </span>
      </div>

      {filteredToolkits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-bold">No toolkits match that filter</h2>
          <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Try a broader search term or reset the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFormat(all);
              setAccess(all);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 hover:bg-teal-300"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredToolkits.map((toolkit, index) => {
            const isAvailable = toolkit.status === "available";
            return (
              <motion.div
                key={toolkit.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (index % 3) * 0.05 }}
                className="flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-teal-400/35 hover:bg-white/[0.07]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10">
                    <Package className="h-5 w-5 text-teal-300" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        toolkit.accessTier === "pro"
                          ? "bg-amber-400/10 text-amber-300"
                          : "bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      {toolkit.accessTier === "pro" ? "Pro" : "Free"}
                    </span>
                    {!isAvailable && (
                      <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Clock className="h-3 w-3" /> Soon
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mb-1.5 text-base font-bold">{toolkit.title}</h3>
                <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{toolkit.problemSolved}</p>

                <dl className="mb-4 space-y-2 text-[11px] text-muted-foreground">
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
                    <dt className="mb-0.5 font-semibold text-foreground/70">For</dt>
                    <dd>{toolkit.audience}</dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
                    <dt className="mb-0.5 font-semibold text-foreground/70">Format</dt>
                    <dd>{toolkit.format}</dd>
                  </div>
                </dl>

                <div className="mt-auto">
                  {isAvailable && toolkit.href ? (
                    <Link
                      href={toolkit.href}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 py-2.5 text-sm font-bold text-teal-950 transition-all hover:-translate-y-0.5 hover:bg-teal-300"
                    >
                      {isPro ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                      {isPro ? "Open kit" : "View kit"}
                    </Link>
                  ) : toolkit.accessTier === "pro" ? (
                    <button
                      onClick={handleUnlock}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-teal-400/30 py-2.5 text-sm font-semibold text-teal-300 transition-all hover:bg-teal-400/10"
                    >
                      <Lock className="h-3.5 w-3.5" /> Unlock with Pro
                    </button>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-semibold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Coming soon
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Every toolkit here is a real, downloadable Pro resource. New toolkits are added as they ship.
      </p>
    </div>
  );
}

function FilterChips({
  label,
  values,
  active,
  onChange,
  labelFor,
}: {
  label: string;
  values: string[];
  active: string;
  onChange: (value: string) => void;
  labelFor?: (value: string) => string;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:max-w-sm lg:pb-0">
      <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground md:inline-flex">
        <Filter className="h-3.5 w-3.5" />
        {label}
      </span>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            active === value
              ? "border-teal-400/40 bg-teal-400/15 text-teal-200"
              : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground"
          }`}
        >
          {labelFor ? labelFor(value) : value}
        </button>
      ))}
    </div>
  );
}
