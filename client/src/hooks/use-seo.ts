import { useEffect } from "react";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}

const SITE_NAME = "Life Science Atlas";

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

// English-only global product: clean URLs, single canonical, no hreflang.
export function useSEO({ title, description, ogImage, canonical }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc =
      description ??
      "Practical workflows, checklists, toolkits, and structured learning for QC/QA and life science professionals.";
    const image = ogImage ?? DEFAULT_OG_IMAGE;
    const url = canonical ?? SITE_URL + window.location.pathname;

    document.title = fullTitle;

    setMeta("description", desc);

    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:image", image, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:locale", "en_US", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", image);

    setLink("canonical", url);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, ogImage, canonical]);
}
