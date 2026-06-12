import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSEO } from "@/hooks/use-seo";

interface Props {
  /** key in the `legal` namespace: terms | privacy */
  page: "terms" | "privacy";
}

export function LegalShell({ page }: Props) {
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

      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:font-bold prose-a:text-primary prose-strong:text-foreground text-muted-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{t(`${page}.body`)}</ReactMarkdown>
      </div>
    </div>
  );
}
