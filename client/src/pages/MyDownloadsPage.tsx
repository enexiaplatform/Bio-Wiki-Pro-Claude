import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Calendar, Download, FileText, Loader2, Lock, Package, ShoppingBag } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import { analytics } from "@/hooks/use-analytics";

interface DeliverableFile {
  filename: string;
  label: string;
  description: string;
  url: string;
}

interface DeliverableProduct {
  id: string;
  name: string;
  files: DeliverableFile[];
}

const panelClass = "rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 md:p-6";

export default function MyDownloadsPage() {
  useSEO({ title: "My Downloads", description: "Download the toolkits and templates you've purchased." });
  const { isAuthenticated } = useUser();
  const [products, setProducts] = useState<DeliverableProduct[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let active = true;
    fetch("/api/downloads", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data) => active && setProducts(data.products ?? []))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  async function download(file: DeliverableFile, productId: string) {
    const res = await fetch(file.url, { credentials: "include" });
    if (!res.ok) {
      alert("This download is not available. Please make sure you are signed in with the account that purchased it.");
      return;
    }
    analytics.downloadClicked(productId, file.filename);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  const fileCount = products?.reduce((sum, product) => sum + product.files.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-6 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              <Package className="h-3.5 w-3.5" />
              Download library
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">My Downloads</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Toolkits, templates, and purchased files stay here so you can return to them when the work gets real.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{products?.length ?? 0}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Products</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/35 p-4">
              <p className="text-2xl font-bold text-teal-200">{fileCount}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Files</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className={panelClass}>
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your downloads...
          </div>
        </div>
      ) : !isAuthenticated ? (
        <EmptyState
          icon={Lock}
          title="Sign in to see your downloads"
          body="Your purchased kits appear here once you are signed in."
          ctaHref="/login"
          ctaLabel="Sign in"
        />
      ) : products && products.length > 0 ? (
        <div className="space-y-5">
          {products.map((product) => (
            <section key={product.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-lg shadow-black/10">
              <div className="border-b border-white/10 bg-background/35 px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-teal-300" />
                    <h2 className="font-bold">{product.name}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                    {product.files.length} files
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-white/10">
                {product.files.map((file) => (
                  <li key={file.filename} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="rounded-lg border border-white/10 bg-background/45 p-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{file.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{file.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => download(file, product.id)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300"
                      data-testid={`download-${file.filename}`}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </li>
                ))}
              </ul>

              {product.id === "gmp_audit_kit" && (
                <div className="border-t border-teal-400/20 bg-teal-400/10 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Your 30-minute consulting call:</span>{" "}
                      reply to your purchase-confirmation email or contact support to book your 1-on-1 audit-plan review.
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No downloads yet"
          body="When you purchase a toolkit, your files will appear here to download anytime."
          ctaHref="/toolkits/gmp-audit-kit"
          ctaLabel="Browse the GMP Audit Kit"
        />
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  icon: typeof Lock;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className={`${panelClass} text-center`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      <Link href={ctaHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300">
        {ctaLabel}
      </Link>
    </div>
  );
}
