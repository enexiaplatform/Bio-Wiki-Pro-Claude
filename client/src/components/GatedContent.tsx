import { useEffect, useState } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lock, Crown, Package } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { ContentCollection, ContentTier } from "@/lib/content";

interface Props {
  collection: ContentCollection;
  slug: string;
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
export function GatedContent({ collection, slug }: Props) {
  const { language } = useLanguage();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    fetch(`/api/content/${collection}/${slug}?lang=${language}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Không tải được nội dung");
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

  if (state.status === "loading") {
    return <div className="py-10 text-sm text-muted-foreground">Đang tải nội dung…</div>;
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
            {isPaid ? "Nội dung trả phí" : "Nội dung dành cho Pro"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isPaid
              ? "Mua sản phẩm này để mở khoá toàn bộ nội dung."
              : "Nâng cấp Pro để xem đầy đủ bài viết này và toàn bộ thư viện Pro."}
          </p>
          <Link
            href={isPaid ? "/pricing" : "/upgrade"}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            {isPaid ? <Package className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {isPaid ? "Xem sản phẩm" : "Nâng cấp Pro"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.body}</ReactMarkdown>
    </article>
  );
}
