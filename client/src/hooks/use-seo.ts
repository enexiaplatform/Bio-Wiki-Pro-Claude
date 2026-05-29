import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}

const SITE_NAME = "BioWikiPro";
const DEFAULT_OG_IMAGE = "https://bio-wiki-pro-claude.vercel.app/og-image.png";
const BASE_URL = "https://bio-wiki-pro-claude.vercel.app";

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

export function useSEO({ title, description, ogImage, canonical }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc = description ?? "Nền tảng kiến thức QC/QA Pharma cho Senior QC/QA professionals tại Việt Nam — GMP, audit tools, career roadmap.";
    const image = ogImage ?? DEFAULT_OG_IMAGE;
    const url = canonical ?? (BASE_URL + window.location.pathname);

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

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", image);

    // Canonical
    setLink("canonical", url);

    return () => {
      // Reset to default on unmount
      document.title = SITE_NAME;
    };
  }, [title, description, ogImage, canonical]);
}
