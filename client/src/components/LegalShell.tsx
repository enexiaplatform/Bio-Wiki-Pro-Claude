import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2 } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

interface Props {
  /** key in the `legal` namespace: terms | privacy | refund */
  page: "terms" | "privacy" | "refund";
  /** show the highlighted guarantee box (refund page) */
  highlight?: boolean;
}

export function LegalShell({ page, highlight }: Props) {
  const { t } = useTranslation("legal");
  useSEO({ title: t(`${page}.seoTitle`), description: t(`${page}.seoDesc`) });

  return (
    <div className="pb-24 pt-8 max-w-3xl mx-auto px-4">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          {t("backHome")}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{t(`${page}.title`)}</h1>
      <p className="text-muted-foreground text-sm mb-8">{t("updated")}</p>

      {highlight && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">{t(`${page}.guaranteeTitle`)}</h2>
              <p className="text-sm text-muted-foreground">{t(`${page}.guaranteeBody`)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:font-bold prose-a:text-primary prose-strong:text-foreground text-muted-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{t(`${page}.body`)}</ReactMarkdown>
      </div>
    </div>
  );
}
