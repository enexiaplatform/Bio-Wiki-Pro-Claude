import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lock, Crown, Package } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { analytics } from "@/hooks/use-analytics";
import type { ContentCollection, ContentTier } from "@/lib/content";

interface Props {
  collection: ContentCollection;
  slug: string;
  /** Rendered after the body, only when the content is unlocked (e.g. a quiz). */
  footer?: ReactNode;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "locked"; tier: ContentTier; title: string; teaser: string }
  | { status: "unlocked"; title: string; body: string };

/**
 * Renders MDX content fetched from the server-gated endpoint. The full body is
 * only ever returned by the server when the session is entitled — so a free
 * user inspecting the network response never sees pro/paid content.
 */
export function GatedContent({ collection, slug, footer }: Props) {
  const { language } = useLanguage();
  const [state, setState] = useState<State>({ status: "loading" });
  const [activeId, setActiveId] = useState<string>("");

  // Scroll-spy: highlight the last heading scrolled past.
  useEffect(() => {
    if (state.status !== "unlocked") return;
    let raf = 0;
    const update = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("article h2[id]"));
      if (els.length < 3) return;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 100) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [state]);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    fetch(`/api/content/${collection}/${slug}?lang=${language}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Could not load content");
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data.locked) {
          setState({ status: "locked", tier: data.tier, title: data.title, teaser: data.teaser ?? "" });
        } else {
          setState({ status: "unlocked", title: data.title, body: data.body });
        }
      })
      .catch((e) => active && setState({ status: "error", message: e.message }));
    return () => {
      active = false;
    };
  }, [collection, slug, language]);

  // Track the paywall encounter (a key conversion moment) once per locked load.
  useEffect(() => {
    if (state.status === "locked") {
      analytics.upgradePromptShown(state.tier === "paid" ? "locked_paid" : "locked_pro");
    }
  }, [state]);

  if (state.status === "loading") {
    return <div className="py-10 text-sm text-muted-foreground">Loading…</div>;
  }

  if (state.status === "error") {
    return <div className="py-10 text-sm text-red-400">{state.message}</div>;
  }

  if (state.status === "locked") {
    const isPaid = state.tier === "paid";
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-display font-bold mb-3">{state.title}</h1>
        {state.teaser && <p className="text-muted-foreground mb-6">{state.teaser}</p>}

        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold mb-2">
            {isPaid ? "Paid content" : "Pro content"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isPaid
              ? "Purchase this product to unlock the full content."
              : "Upgrade to Pro to read this lesson in full and unlock the entire Pro library."}
          </p>
          <Link
            href={isPaid ? "/pricing" : "/upgrade"}
            onClick={() => analytics.upgradePromptClicked(isPaid ? "locked_paid" : "locked_pro")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            {isPaid ? <Package className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {isPaid ? "View product" : "Upgrade to Pro"}
          </Link>
        </div>
      </div>
    );
  }

  // Table of contents from H2 headings (shown for longer lessons).
  const headings = Array.from(state.body.matchAll(/^##\s+(.+)$/gm)).map((m) => ({
    text: m[1].trim(),
    id: slugify(m[1].trim()),
  }));
  const showToc = headings.length >= 3;

  const article = (
    <article className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={slugify(childText(children))} className="scroll-mt-24">{children}</h2>,
        }}
      >
        {state.body}
      </ReactMarkdown>
    </article>
  );

  return (
    <>
      <div className={showToc ? "lg:grid lg:grid-cols-[minmax(0,1fr)_210px] lg:gap-10 lg:items-start" : ""}>
        <div className="min-w-0">
          {showToc && (
            <Toc headings={headings} activeId={activeId} className="lg:hidden mb-8 rounded-xl border border-white/10 bg-card/50 p-4 print:hidden" />
          )}
          {article}
        </div>
        {showToc && (
          <aside className="hidden lg:block">
            <Toc headings={headings} activeId={activeId} className="sticky top-24 border-l border-white/10 pl-4" />
          </aside>
        )}
      </div>
      {footer}
    </>
  );
}

function Toc({
  headings,
  activeId,
  className,
}: {
  headings: { text: string; id: string }[];
  activeId: string;
  className?: string;
}) {
  return (
    <nav className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">On this page</p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={
                "block text-sm transition-colors " +
                (activeId === h.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground")
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function childText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childText).join("");
  return "";
}
