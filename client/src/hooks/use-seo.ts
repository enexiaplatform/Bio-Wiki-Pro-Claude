import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LNGS, DEFAULT_LNG, isSupportedLng, type Lng } from "@/i18n";
import { stripLangPrefix, withLang } from "@/i18n/locale-routing";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}

const SITE_NAME = "BioWikiPro";
const BASE_URL = SITE_URL;

// Open Graph locale codes per language
const OG_LOCALE: Record<Lng, string> = {
  vi: "vi_VN",
  en: "en_US",
};

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Replace ALL hreflang alternate links each run so stale ones never linger.
function setAlternates(entries: { hreflang: string; href: string }[]) {
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());
  for (const { hreflang, href } of entries) {
    const el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", hreflang);
    el.setAttribute("href", href);
    document.head.appendChild(el);
  }
}

export function useSEO({ title, description, ogImage, canonical }: SEOProps) {
  const { i18n } = useTranslation();
  const lang: Lng = isSupportedLng(i18n.language) ? i18n.language : DEFAULT_LNG;

  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc =
      description ??
      "Nền tảng kiến thức QC/QA Pharma cho Senior QC/QA professionals tại Việt Nam — GMP, audit tools, career roadmap.";
    const image = ogImage ?? DEFAULT_OG_IMAGE;

    // Path without the language prefix, e.g. "/en/pricing" → "/pricing"
    const restPath = stripLangPrefix(window.location.pathname);
    const url = canonical ?? BASE_URL + withLang(lang, restPath);

    // Title
    document.title = fullTitle;

    // Standard meta
    setMeta("description", desc);

    // Open Graph
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:image", image, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:locale", OG_LOCALE[lang], "property");
    // og:locale:alternate for the other supported language(s)
    const altLocale = SUPPORTED_LNGS.find((l) => l !== lang);
    if (altLocale) setMeta("og:locale:alternate", OG_LOCALE[altLocale], "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", image);

    // Canonical (language-prefixed)
    setLink("canonical", url);

    // hreflang alternates: one per language + x-default → default (vi)
    setAlternates([
      ...SUPPORTED_LNGS.map((l) => ({
        hreflang: l,
        href: BASE_URL + withLang(l, restPath),
      })),
      { hreflang: "x-default", href: BASE_URL + withLang(DEFAULT_LNG, restPath) },
    ]);

    return () => {
      // Reset to default on unmount
      document.title = SITE_NAME;
    };
  }, [title, description, ogImage, canonical, lang]);
}
