import { useState } from "react";
import { Link, useParams } from "wouter";
import { Award, Printer, Lock, ChevronRight, FlaskConical, Download } from "lucide-react";
import { getLearningPath } from "@/data/learningPaths";
import { getContentBySlug } from "@/lib/content";
import { useReadLessons } from "@/hooks/use-read-lessons";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";
import NotFound from "@/pages/not-found";

export default function CertificatePage() {
  const { slug = "" } = useParams();
  const { isRead } = useReadLessons();
  const { user } = useUser();
  const path = getLearningPath(slug);

  useSEO({
    title: path ? `Certificate — ${path.title}` : "Certificate",
    description: path ? `Certificate of completion for the ${path.title} learning path.` : undefined,
  });

  const defaultName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const [name, setName] = useState(defaultName);

  if (!path) return <NotFound />;

  const lessons = path.lessonSlugs
    .map((s) => getContentBySlug("academy", s, "en"))
    .filter((e): e is NonNullable<typeof e> => !!e);
  const readCount = lessons.filter((l) => isRead(l.slug)).length;
  const complete = lessons.length > 0 && readCount === lessons.length;

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Deterministic, human-readable certificate id (cosmetic — same inputs → same id).
  function shortHash(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  }
  const certId = `BWP-${path.slug.slice(0, 3).toUpperCase()}-${shortHash(`${path.slug}|${name.trim().toLowerCase()}|${today}`)}`;

  // Render the certificate to a 1200×800 PNG entirely client-side (no deps),
  // for sharing on LinkedIn etc.
  async function downloadImage() {
    if (!path) return;
    try {
      await (document as any).fonts?.ready;
    } catch {
      /* fonts API optional */
    }
    const W = 1200, H = 800;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = W / 2;
    const maxW = W - 160;

    const fit = (text: string, base: number, weight: string) => {
      let size = base;
      do {
        ctx.font = `${weight} ${size}px 'Space Grotesk', sans-serif`;
        if (ctx.measureText(text).width <= maxW) break;
        size -= 2;
      } while (size > 16);
      return size;
    };

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b1220");
    bg.addColorStop(1, "#0f2420");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const accent = ctx.createLinearGradient(0, 0, W, 0);
    accent.addColorStop(0, "#2dd4bf");
    accent.addColorStop(1, "#34d399");
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 10);

    ctx.strokeStyle = "rgba(45,212,191,0.35)";
    ctx.lineWidth = 2;
    if ((ctx as any).roundRect) {
      ctx.beginPath();
      (ctx as any).roundRect(40, 40, W - 80, H - 80, 20);
      ctx.stroke();
    }

    ctx.textAlign = "center";

    ctx.fillStyle = "#f8fafc";
    ctx.font = "700 34px 'Space Grotesk', sans-serif";
    ctx.fillText("BioWikiPro", cx, 132);

    ctx.fillStyle = "#34d399";
    if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "4px";
    ctx.font = "700 22px 'Space Grotesk', sans-serif";
    ctx.fillText("CERTIFICATE OF COMPLETION", cx, 232);
    if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 20px 'Inter', sans-serif";
    ctx.fillText("This certifies that", cx, 300);

    const nm = name.trim() || "—";
    ctx.fillStyle = "#f8fafc";
    ctx.font = `700 ${fit(nm, 54, "700")}px 'Space Grotesk', sans-serif`;
    ctx.fillText(nm, cx, 372);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 20px 'Inter', sans-serif";
    ctx.fillText("has successfully completed the learning path", cx, 432);

    ctx.fillStyle = "#f8fafc";
    ctx.font = `600 ${fit(path.title, 32, "600")}px 'Space Grotesk', sans-serif`;
    ctx.fillText(path.title, cx, 482);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 18px 'Inter', sans-serif";
    ctx.fillText(`${lessons.length} lessons    ·    ${today}`, cx, 560);

    ctx.fillStyle = "#34d399";
    ctx.font = "600 15px 'Inter', sans-serif";
    ctx.fillText("✓ Verified completion · BioWikiPro", cx, 662);

    ctx.fillStyle = "#64748b";
    ctx.font = "400 14px 'Inter', sans-serif";
    ctx.fillText(`Certificate ID: ${certId} · biowikipro.com`, cx, 692);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `biowikipro-certificate-${path.slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  if (!complete) {
    return (
      <div className="pb-24 pt-10 max-w-xl mx-auto px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Certificate locked</h1>
        <p className="text-muted-foreground mb-6">
          Finish all {lessons.length} lessons in <strong>{path.title}</strong> to unlock your certificate. You've completed {readCount}.
        </p>
        <Link
          href={`/paths/${path.slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Go to the path <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-3xl mx-auto px-4">
      {/* Controls — hidden when printing */}
      <div className="flex items-center justify-between gap-3 mb-6" data-print="hide">
        <Link href={`/paths/${path.slug}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to path
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadImage}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:border-white/30 transition-colors"
          >
            <Download className="w-4 h-4" /> Download image
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      <div className="mb-4" data-print="hide">
        <label htmlFor="cert-name" className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
          Name on certificate
        </label>
        <input
          id="cert-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="w-full max-w-sm rounded-lg border border-border bg-card py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* The certificate */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-card to-background p-8 md:p-12 text-center print:border-gray-300 print:bg-white print:from-white print:to-white">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400" />

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center print:bg-emerald-100">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg print:text-gray-900">BioWiki<span className="text-primary">Pro</span></span>
        </div>

        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 print:bg-emerald-100">
          <Award className="w-7 h-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Certificate of Completion</p>
        <p className="text-sm text-muted-foreground mb-1 print:text-gray-600">This certifies that</p>
        <p className="text-2xl md:text-3xl font-display font-bold mb-3 print:text-gray-900 break-words">
          {name.trim() || "—"}
        </p>
        <p className="text-sm text-muted-foreground mb-1 print:text-gray-600">has successfully completed the learning path</p>
        <p className="text-lg md:text-xl font-semibold mb-6 print:text-gray-900">{path.title}</p>

        <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground print:text-gray-600">
          <div>
            <p className="font-bold text-foreground print:text-gray-900">{lessons.length}</p>
            <p>lessons</p>
          </div>
          <div className="h-8 w-px bg-white/10 print:bg-gray-300" />
          <div>
            <p className="font-bold text-foreground print:text-gray-900">{today}</p>
            <p>date completed</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1">
          <p className="text-[11px] font-semibold tracking-wide text-primary/80 print:text-emerald-700">
            ✓ Verified completion · BioWikiPro
          </p>
          <p className="text-[11px] text-muted-foreground/70 print:text-gray-500">
            Certificate ID: {certId} · QC/QA knowledge for Pharma &amp; Life Sciences · biowikipro.com
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4" data-print="hide">
        Tip: use "Save as PDF" in the print dialog, then share it on LinkedIn.
      </p>
    </div>
  );
}
