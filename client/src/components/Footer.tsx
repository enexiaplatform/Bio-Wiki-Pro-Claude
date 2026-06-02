import { Link } from "wouter";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="hidden md:block border-t border-white/5 bg-background/80 backdrop-blur-md mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm">BioWikiPro</span>
            <span className="text-muted-foreground text-xs">{t("copyright", { year })}</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/toolkits/gmp-audit-kit" className="hover:text-primary transition-colors">
              {t("links.gmpKit")}
            </Link>
            <Link href="/academy" className="hover:text-primary transition-colors">
              {t("links.academy")}
            </Link>
            <Link href="/glossary" className="hover:text-primary transition-colors">
              Glossary
            </Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">
              {t("links.pricing")}
            </Link>
            <span className="w-px h-3 bg-white/10" />
            <Link href="/terms" className="hover:text-primary transition-colors">
              {t("links.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {t("links.privacy")}
            </Link>
            <Link href="/refund" className="hover:text-primary transition-colors">
              {t("links.refund")}
            </Link>
          </nav>

          {/* Contact */}
          <a
            href="mailto:support@biowikipro.com"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            support@biowikipro.com
          </a>
        </div>
      </div>
    </footer>
  );
}
