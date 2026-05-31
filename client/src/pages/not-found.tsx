import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">{t("notFound.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("notFound.subtitle")}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" /> {t("notFound.home")}
        </Link>
      </div>
    </div>
  );
}
