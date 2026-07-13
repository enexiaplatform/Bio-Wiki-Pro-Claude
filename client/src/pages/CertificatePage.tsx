import { useState } from "react";
import { Link, useParams } from "wouter";
import { Award, BookOpenCheck, ChevronRight, Download, Lock, Printer, ShieldCheck } from "lucide-react";
import { getContentBySlug } from "@/lib/content";
import { getLearningPath } from "@/data/learningPaths";
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
    title: path ? `Learning completion record - ${path.title}` : "Learning completion record",
    description: path ? `Learning-path completion record for ${path.title}. This is not an accredited qualification or competency assessment.` : undefined,
  });

  const defaultName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const [name, setName] = useState(defaultName);

  if (!path) return <NotFound />;
  const currentPath = path;

  const lessons = currentPath.lessonSlugs
    .map((s) => getContentBySlug("academy", s, "en"))
    .filter((e): e is NonNullable<typeof e> => !!e);
  const readCount = lessons.filter((l) => isRead(l.slug)).length;
  const complete = lessons.length > 0 && readCount === lessons.length;
  const percent = lessons.length ? Math.round((readCount / lessons.length) * 100) : 0;
  const remaining = Math.max(lessons.length - readCount, 0);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  function shortHash(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  }

  const displayName = name.trim() || "Your name";
  const certId = `LSA-${currentPath.slug.slice(0, 3).toUpperCase()}-${shortHash(`${currentPath.slug}|${displayName.toLowerCase()}|${today}`)}`;

  async function downloadImage() {
    try {
      await (document as any).fonts?.ready;
    } catch {
      /* optional browser API */
    }
    const W = 1200;
    const H = 800;
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
    bg.addColorStop(0, "#08131f");
    bg.addColorStop(1, "#0d241f");
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
      (ctx as any).roundRect(44, 44, W - 88, H - 88, 18);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#f8fafc";
    ctx.font = "700 34px 'Space Grotesk', sans-serif";
    ctx.fillText("Life Science Atlas", cx, 132);

    ctx.fillStyle = "#34d399";
    if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "4px";
    ctx.font = "700 22px 'Space Grotesk', sans-serif";
    ctx.fillText("LEARNING PATH COMPLETION", cx, 232);
    if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 20px 'Inter', sans-serif";
    ctx.fillText("This records that", cx, 300);

    ctx.fillStyle = "#f8fafc";
    ctx.font = `700 ${fit(displayName, 54, "700")}px 'Space Grotesk', sans-serif`;
    ctx.fillText(displayName, cx, 372);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 20px 'Inter', sans-serif";
    ctx.fillText("has opened every lesson in the Atlas learning path", cx, 432);

    ctx.fillStyle = "#f8fafc";
    ctx.font = `600 ${fit(currentPath.title, 32, "600")}px 'Space Grotesk', sans-serif`;
    ctx.fillText(currentPath.title, cx, 482);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 18px 'Inter', sans-serif";
    ctx.fillText(`${lessons.length} lessons | ${today}`, cx, 560);

    ctx.fillStyle = "#34d399";
    ctx.font = "600 15px 'Inter', sans-serif";
    ctx.fillText("ATLAS LEARNING RECORD | NOT AN ACCREDITED QUALIFICATION", cx, 662);

    ctx.fillStyle = "#64748b";
    ctx.font = "400 14px 'Inter', sans-serif";
    ctx.fillText(`Learning record ID: ${certId} | Life Science Atlas`, cx, 692);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `life-science-atlas-learning-record-${currentPath.slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  if (!complete) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-6 md:pt-10">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center shadow-xl shadow-black/10 md:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-300">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Completion record locked</p>
          <h1 className="text-3xl font-bold tracking-tight">Finish the path to unlock your learning record</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            You have opened {readCount} of {lessons.length} lessons in <strong className="text-foreground">{path.title}</strong>.
            Open {remaining} more {remaining === 1 ? "lesson" : "lessons"} to generate a learning-path completion record.
          </p>
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-white/10 bg-background/45 p-4 text-left">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Path progress</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal-400" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <Link
            href={`/paths/${path.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300"
          >
            Continue the path <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-6 md:pt-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-print="hide">
        <Link href={`/paths/${path.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to path
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={downloadImage}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/30"
          >
            <Download className="h-4 w-4" /> Download record image
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-300"
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
        </div>
      </div>

      <section className="mb-5 grid gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 md:grid-cols-[1fr_auto] md:items-end" data-print="hide">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Learning path opened in full</p>
          <h1 className="text-2xl font-bold md:text-3xl">{path.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Personalize the learning record, then download an image or save as PDF.
          </p>
        </div>
        <label className="block min-w-0 md:w-72">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Name on learning record
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border border-white/10 bg-background/65 px-3 py-2 text-sm outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
          />
        </label>
      </section>

      <section className="relative overflow-hidden rounded-lg border border-teal-400/25 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-5 text-center shadow-xl shadow-black/15 print:border-gray-300 print:bg-white print:from-white print:to-white md:p-10">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400" />

        <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-lg border border-white/10 bg-background/45 px-3 py-2 print:border-gray-200 print:bg-white">
          <ShieldCheck className="h-4 w-4 text-teal-300 print:text-emerald-700" />
          <span className="text-sm font-bold print:text-gray-900">Life Science Atlas</span>
        </div>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-teal-400/25 bg-teal-400/10 text-teal-300 print:bg-emerald-50">
          <Award className="h-7 w-7" />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-300 print:text-emerald-700">
          Learning Path Completion
        </p>
        <p className="mb-2 text-sm text-muted-foreground print:text-gray-600">This records that</p>
        <p className="mb-3 break-words text-3xl font-bold tracking-tight print:text-gray-900 md:text-4xl">{displayName}</p>
        <p className="mb-2 text-sm text-muted-foreground print:text-gray-600">has opened every lesson in the Atlas learning path</p>
        <p className="mx-auto mb-8 max-w-2xl text-xl font-semibold print:text-gray-900 md:text-2xl">{path.title}</p>

        <div className="mx-auto grid max-w-xl grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-white/10 bg-background/45 p-3 print:border-gray-200 print:bg-white">
            <p className="font-bold print:text-gray-900">{lessons.length}</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">lessons opened</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/45 p-3 print:border-gray-200 print:bg-white">
            <p className="font-bold print:text-gray-900">{today}</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">recorded</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/45 p-3 print:border-gray-200 print:bg-white">
            <p className="font-bold print:text-gray-900">{certId}</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">learning record ID</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-300 print:text-emerald-700">
            <BookOpenCheck className="h-4 w-4" /> Atlas learning record
          </p>
          <p className="text-xs text-muted-foreground/80 print:text-gray-500">
            Supporting evidence learning | Not an accredited qualification
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.055] p-4 text-left" data-print="hide">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">What this record means</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This record reflects lesson-open status in Atlas. It does not verify knowledge retention, practical competence,
          GMP training authorization, employer approval, or an accredited qualification.
        </p>
      </section>

      <p className="mt-4 text-center text-xs text-muted-foreground" data-print="hide">
        Tip: choose "Save as PDF" in the print dialog for a clean shareable copy.
      </p>
    </main>
  );
}
