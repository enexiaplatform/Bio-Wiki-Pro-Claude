import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Download, Package, FileText, Lock, Loader2, Calendar } from "lucide-react";
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
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => active && setProducts(d.products ?? []))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  async function download(file: DeliverableFile, productId: string) {
    // Fetch with credentials, then trigger a browser save (the endpoint is gated).
    const res = await fetch(file.url, { credentials: "include" });
    if (!res.ok) {
      alert("This download isn't available — please make sure you're signed in with the account that purchased it.");
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

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-3xl mx-auto px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">My Downloads</h1>
          <p className="text-sm text-muted-foreground">Toolkits and templates from your purchases.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading your downloads…
        </div>
      ) : !isAuthenticated ? (
        <EmptyState
          title="Sign in to see your downloads"
          body="Your purchased kits appear here once you're signed in."
          ctaHref="/login"
          ctaLabel="Sign in"
        />
      ) : products && products.length > 0 ? (
        <div className="space-y-6">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">{p.name}</h2>
              </div>
              <ul className="divide-y divide-white/5">
                {p.files.map((f) => (
                  <li key={f.filename} className="flex items-center gap-4 px-5 py-4">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                    <button
                      onClick={() => download(f, p.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 text-xs font-semibold transition-colors"
                      data-testid={`download-${f.filename}`}
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </li>
                ))}
              </ul>
              {p.id === "gmp_audit_kit" && (
                <div className="px-5 py-4 border-t border-white/10 bg-primary/5 flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Your 30-minute consulting call:</span>{" "}
                    reply to your purchase-confirmation email (or contact support) to book your 1-on-1
                    audit-plan review.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No downloads yet"
          body="When you purchase a toolkit (like the GMP Audit Survival Kit), your files will appear here to download anytime."
          ctaHref="/toolkits/gmp-audit-kit"
          ctaLabel="Browse the GMP Audit Kit"
        />
      )}
    </div>
  );
}

function EmptyState({ title, body, ctaHref, ctaLabel }: { title: string; body: string; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 text-muted-foreground flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">{body}</p>
      <Link href={ctaHref} className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors">
        {ctaLabel}
      </Link>
    </div>
  );
}
