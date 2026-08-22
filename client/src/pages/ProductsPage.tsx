import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Box,
  BriefcaseBusiness,
  Check,
  CircleHelp,
  Crown,
  FlaskConical,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react";
import {
  ReactFlow,
  type Edge,
  type Node,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSEO } from "@/hooks/use-seo";

type ProductKey = "quality-lab" | "pro" | "career";

type Product = {
  id: ProductKey;
  intent: string;
  title: string;
  summary: string;
  href: string;
  image: string;
  imageAlt: string;
  icon: typeof FlaskConical;
  accent: string;
  defaultBorder: string;
  selectedBorder: string;
  selectedShadow: string;
  iconSurface: string;
  ctaClass: string;
  boundary: string;
};

const products: Product[] = [
  {
    id: "quality-lab",
    intent: "Plan a quality laboratory",
    title: "Quality Lab Blueprint",
    summary: "Translate products, markets, and testing demand into one controlled basis for capability, capacity, cost, and risk.",
    href: "/quality-lab",
    image: "/images/blueprint/quality-lab-blueprint-deliverables.webp",
    imageAlt: "Quality Lab Blueprint executive brief, capacity model, cost scenario, and evidence register",
    icon: FlaskConical,
    accent: "text-teal-300",
    defaultBorder: "border-teal-300/35",
    selectedBorder: "border-teal-300/80",
    selectedShadow: "shadow-[0_0_34px_rgba(45,212,191,0.16)]",
    iconSurface: "border-teal-300/50 bg-teal-300/[0.08] text-teal-300",
    ctaClass: "bg-teal-300 text-slate-950 hover:bg-teal-200 focus-visible:ring-teal-100",
    boundary: "Human review only in paid Blueprint scope.",
  },
  {
    id: "pro",
    intent: "Strengthen my professional quality work",
    title: "Atlas Pro",
    summary: "Deeper reusable evidence, tools, and working files for recurring quality work across the organization.",
    href: "/pro",
    image: "/images/products/atlas-pro-review-canvas.png",
    imageAlt: "Atlas Pro monthly quality review canvas",
    icon: Crown,
    accent: "text-sky-400",
    defaultBorder: "border-sky-400/35",
    selectedBorder: "border-sky-400/80",
    selectedShadow: "shadow-[0_0_34px_rgba(56,189,248,0.15)]",
    iconSurface: "border-sky-400/50 bg-sky-400/[0.08] text-sky-400",
    ctaClass: "bg-sky-400 text-slate-950 hover:bg-sky-300 focus-visible:ring-sky-100",
    boundary: "No project-specific expert review.",
  },
  {
    id: "career",
    intent: "Plan my next career move",
    title: "Personal Career Blueprint",
    summary: "A personalized 13-week proof plan built from your evidence, constraints, timeline, and target route.",
    href: "/career",
    image: "/images/career/personal-career-blueprint-preview.webp",
    imageAlt: "Personal Career Blueprint cover and evidence comparison page",
    icon: BriefcaseBusiness,
    accent: "text-amber-400",
    defaultBorder: "border-amber-400/35",
    selectedBorder: "border-amber-400/80",
    selectedShadow: "shadow-[0_0_34px_rgba(251,191,36,0.13)]",
    iconSurface: "border-amber-400/50 bg-amber-400/[0.07] text-amber-400",
    ctaClass: "bg-amber-400 text-slate-950 hover:bg-amber-300 focus-visible:ring-amber-100",
    boundary: "No hiring or credential guarantee.",
  },
];

const qualityOffers = [
  ["01", "Free model", "See the initial capability picture"],
  ["02", "$149 diagnostic", "Clarify scope and decision gaps"],
  ["03", "Blueprint from $990", "Receive the reviewed package"],
];

const proFeatures = [
  "Reusable evidence",
  "Professional tools",
  "Working files",
  "Current standards",
];

const careerFeatures = [
  "Named for you",
  "Role-specific",
  "Evidence-led",
  "Lifetime workspace",
];

function DecisionBranches() {
  const nodes = useMemo<Node[]>(() => [
    {
      id: "question",
      position: { x: 639, y: 2 },
      sourcePosition: Position.Bottom,
      style: { width: 2, height: 2, opacity: 0, padding: 0, border: 0 },
      data: { label: "" },
    },
    ...[
      ["quality", 203],
      ["pro", 639],
      ["career", 1076],
    ].map(([id, x]) => ({
      id: String(id),
      position: { x: Number(x), y: 70 },
      targetPosition: Position.Top,
      style: { width: 2, height: 2, opacity: 0, padding: 0, border: 0 },
      data: { label: "" },
    })),
  ], []);

  const edges = useMemo<Edge[]>(() => [
    {
      id: "question-quality",
      source: "question",
      target: "quality",
      type: "bezier",
      style: { stroke: "#2dd4bf", strokeWidth: 2 },
    },
    {
      id: "question-pro",
      source: "question",
      target: "pro",
      type: "bezier",
      style: { stroke: "#38bdf8", strokeWidth: 2 },
    },
    {
      id: "question-career",
      source: "question",
      target: "career",
      type: "bezier",
      style: { stroke: "#fbbf24", strokeWidth: 2 },
    },
  ], []);

  return (
    <div className="pointer-events-none hidden h-20 w-full xl:block" aria-hidden="true">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        zoomOnScroll={false}
        preventScrolling={false}
        tabIndex={-1}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

function ProductCard({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = product.icon;

  return (
    <button
      type="button"
      aria-label={`Select ${product.title}`}
      aria-pressed={selected}
      onClick={onSelect}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[1.15rem] border bg-[#071a2d] p-3.5 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:p-4 ${
        selected
          ? `${product.selectedBorder} ${product.selectedShadow}`
          : `${product.defaultBorder} hover:-translate-y-1 hover:brightness-110`
      }`}
    >
      <span
        className={`absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[#061426] transition ${
          selected ? product.selectedBorder : "border-white/20"
        }`}
        aria-hidden="true"
      >
        <Check className={`h-4 w-4 ${selected ? product.accent : "text-slate-500"}`} />
      </span>

      <span className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${product.iconSurface}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-5 text-slate-200">{product.intent}</span>
          <span className={`mt-1 block font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.025em] ${product.accent}`}>
            {product.title}
          </span>
        </span>
      </span>

      <span className="mt-3 block text-[13px] leading-[1.55] text-slate-300">{product.summary}</span>

      <span className="mt-3 flex h-52 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#051222]/70">
        <img
          src={product.image}
          alt={product.imageAlt}
          width="900"
          height="720"
          decoding="async"
          className={`max-h-full w-full object-contain transition duration-300 group-hover:scale-[1.015] ${
            product.id === "pro" ? "p-2" : ""
          }`}
        />
      </span>

      {product.id === "quality-lab" ? (
        <span className="mt-3 grid grid-cols-3 divide-x divide-teal-300/15 border-y border-teal-300/15 py-2.5">
          {qualityOffers.map(([number, title, body]) => (
            <span key={number} className="px-2 first:pl-0 last:pr-0">
              <span className="block text-[9px] font-bold tracking-[0.15em] text-teal-300">{number}</span>
              <span className="mt-1 block text-[11px] font-bold leading-4 text-white">{title}</span>
              <span className="mt-1 hidden text-[9px] leading-4 text-slate-400 sm:block">{body}</span>
            </span>
          ))}
        </span>
      ) : null}

      {product.id === "pro" ? (
        <>
          <span className="mt-3 grid grid-cols-2 gap-1.5">
            {proFeatures.map((feature) => (
              <span key={feature} className="flex min-h-9 items-center gap-2 rounded-lg border border-sky-400/12 bg-sky-400/[0.04] px-2.5 text-[10px] font-semibold leading-4 text-slate-300">
                <Box className="h-3.5 w-3.5 shrink-0 text-sky-400" /> {feature}
              </span>
            ))}
          </span>
          <span className="mt-3 border-t border-sky-400/15 pt-3 text-center">
            <span className="block text-base font-bold text-sky-400">$8/month or $80/year when available</span>
            <span className="mt-1 block text-[11px] text-slate-400">Not project-specific review</span>
          </span>
        </>
      ) : null}

      {product.id === "career" ? (
        <>
          <span className="mt-3 flex flex-wrap justify-center gap-1.5">
            {careerFeatures.map((feature) => (
              <span key={feature} className="rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-1 text-[9px] font-bold text-amber-300">
                {feature}
              </span>
            ))}
          </span>
          <span className="mt-3 border-t border-amber-400/15 pt-3 text-center">
            <span className="block text-base font-bold text-amber-400">Free snapshot</span>
            <span className="mt-0.5 block text-xs text-amber-200">$20 full Blueprint · one-time</span>
          </span>
        </>
      ) : null}
    </button>
  );
}

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>("quality-lab");
  const selected = products.find((product) => product.id === selectedProduct) ?? products[0];

  useSEO({
    title: "Life Science Atlas Products",
    description: "Choose the Atlas product that matches the quality laboratory, professional, or career decision in front of you.",
  });

  return (
    <div
      className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[#061426] text-slate-100"
      style={{
        backgroundImage: "url('/images/blueprint/decision-observatory-grid.jpg')",
        backgroundPosition: "center top",
        backgroundSize: "cover",
      }}
    >
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl flex-col px-4 pb-4 pt-7 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-5xl text-center">
          <h1 className="font-display text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.25rem]">
            Choose the decision. <span className="text-teal-300">Atlas routes the work.</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Answer one question and we’ll guide you to the right product and next step.
          </p>
        </header>

        <div className="mx-auto mt-5 w-full max-w-md rounded-xl border border-cyan-300/55 bg-[#071a2d] px-5 py-4 text-center shadow-[0_0_24px_rgba(34,211,238,0.09)] sm:py-6">
          <span className="mx-auto -mt-10 mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-teal-300 bg-[#061426] text-teal-300" aria-hidden="true">
            <CircleHelp className="h-6 w-6" />
          </span>
          <h2 className="text-base font-semibold text-white sm:text-lg">What are you trying to move forward?</h2>
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <DecisionBranches />
          <div className="mt-6 grid gap-5 lg:grid-cols-3 xl:mt-2 xl:gap-8">
            {products.map((product) => {
              const isSelected = product.id === selectedProduct;
              return (
                <div key={product.id} className="flex flex-col">
                  <ProductCard
                    product={product}
                    selected={isSelected}
                    onSelect={() => setSelectedProduct(product.id)}
                  />
                  {isSelected ? (
                    <Link
                      href={product.href}
                      className={`mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 lg:hidden ${product.ctaClass}`}
                    >
                      Open {product.title} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-2 hidden w-full max-w-md text-center lg:block">
          <Link
            href={selected.href}
            className={`inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg px-5 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 ${selected.ctaClass}`}
          >
            Open {selected.title} <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-1.5 text-[11px] text-slate-500">You can change your decision at any time.</p>
        </div>

        <aside className="mt-2 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 text-[11px] text-slate-400 sm:grid-cols-2 lg:grid-cols-4" aria-label="Atlas product boundaries">
          <span className="flex min-h-11 items-center gap-2.5 bg-[#07182b]/95 px-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-teal-300" />
            Evidence-led; qualified review where scoped.
          </span>
          <span className="flex min-h-11 items-center gap-2.5 bg-[#07182b]/95 px-4">
            <Box className="h-4 w-4 shrink-0 text-teal-300" />
            Product and payment models stay separate.
          </span>
          <span className="flex min-h-11 items-center gap-2.5 bg-[#07182b]/95 px-4">
            <LockKeyhole className="h-4 w-4 shrink-0 text-teal-300" />
            Browser-local by default until you choose to save.
          </span>
          <span className="flex min-h-11 items-center gap-2.5 bg-[#07182b]/95 px-4">
            <Network className="h-4 w-4 shrink-0 text-teal-300" />
            {selected.boundary}
          </span>
        </aside>
      </section>
    </div>
  );
}
