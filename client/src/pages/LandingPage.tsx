import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen, Package, Briefcase, ArrowRight, CheckCircle2,
  FlaskConical, ChevronRight, TrendingUp, Users, Star,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const stats = [
  { value: "48", label: "Bài học chuyên sâu" },
  { value: "7", label: "Module kiến thức" },
  { value: "GMP", label: "WHO • Annex 1 • ISO" },
  { value: "Free", label: "Truy cập Academy" },
];

const problems = [
  {
    emoji: "📈",
    title: "Mắc kẹt ở Senior QC quá lâu?",
    desc: "Có kinh nghiệm, làm tốt — nhưng không biết cần thêm gì để thuyết phục sếp cho lên Supervisor hay Manager.",
  },
  {
    emoji: "⏰",
    title: "Audit đến gần, team chưa sẵn sàng?",
    desc: "Không có checklist cụ thể, SOP thiếu sót, auditor hỏi là team lúng túng. Stress mỗi mùa audit.",
  },
  {
    emoji: "🔍",
    title: "Kiến thức GMP còn lỗ hổng?",
    desc: "Biết làm trong thực tế nhưng không có framework hệ thống — khó giải thích khi audit hay phỏng vấn.",
  },
];

const solutions = [
  {
    icon: BookOpen,
    badge: "Miễn phí",
    badgeColor: "text-emerald-400 bg-emerald-400/10",
    title: "Academy",
    desc: "48 bài học director-level về GMP, sterility testing, OOS investigation, Annex 1, CAPA — hoàn toàn miễn phí.",
    cta: "Học ngay",
    href: "/academy",
    ctaStyle: "border border-white/10 hover:border-white/30",
  },
  {
    icon: Package,
    badge: "$59 one-time",
    badgeColor: "text-teal-400 bg-teal-400/10",
    title: "GMP Audit Survival Kit",
    desc: "SOP gap analysis, CAPA templates, audit interview scripts, mock audit walkthrough + 30-min consulting call.",
    cta: "Xem Kit",
    href: "/toolkits/gmp-audit-kit",
    ctaStyle: "bg-teal-500 hover:bg-teal-400 text-teal-950",
    featured: true,
  },
  {
    icon: Briefcase,
    badge: "Career Roadmap",
    badgeColor: "text-blue-400 bg-blue-400/10",
    title: "Career Hub",
    desc: "Lộ trình từ QC Analyst lên QA Director — salary thực tế, skills cần có, target employers tại Việt Nam.",
    cta: "Xem lộ trình",
    href: "/career",
    ctaStyle: "border border-white/10 hover:border-white/30",
  },
];

const miniFeatures = [
  "Nội dung cập nhật theo GMP WHO 2023 & Annex 1 2022",
  "Viết bởi người có kinh nghiệm thực tế cả phía QC lẫn phía vendor",
  "Tập trung vào thị trường Pharma & F&B Việt Nam",
  "Không lý thuyết suông — framework áp dụng được ngay",
];

export default function LandingPage() {
  useSEO({
    title: "BioWikiPro — Nền tảng kiến thức QC/QA Pharma Vietnam",
    description: "Từ Senior QC lên QA Manager: 48 bài học GMP miễn phí, GMP Audit Survival Kit, và career toolkit cho QC/QA Pharma & Life Science Vietnam.",
  });
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative pt-12 pb-20 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[200px] h-[200px] bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest text-teal-400 bg-teal-400/10 px-3 py-1.5 rounded-full mb-6">
              <FlaskConical className="w-3 h-3" />
              Nền tảng kiến thức QC/QA Pharma
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-4xl md:text-6xl font-bold mb-6 font-display leading-tight"
          >
            Từ Senior QC{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              lên QA Manager
            </span>
            <br className="hidden md:block" />
            {" "}— có hệ thống, không đoán mò
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Kiến thức GMP chuyên sâu, công cụ chuẩn bị audit, và lộ trình thăng tiến thực tế
            — dành cho QC/QA professionals trong ngành Pharma & F&B Việt Nam.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Link href="/academy">
              <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 font-semibold px-6 py-3 rounded-xl transition-all">
                <BookOpen className="w-4 h-4" />
                Khám phá Academy miễn phí
              </button>
            </Link>
            <Link href="/toolkits/gmp-audit-kit">
              <button className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20">
                <Package className="w-4 h-4" />
                GMP Audit Kit — $59
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-teal-400 mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Nghe có quen không?</h2>
            <p className="text-muted-foreground text-sm">Những vấn đề phổ biến của Senior QC/QA sau 3–5 năm kinh nghiệm</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-white/5 rounded-2xl p-6"
              >
                <div className="text-3xl mb-4">{p.emoji}</div>
                <h3 className="font-bold text-sm mb-2 leading-snug">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Giải pháp trong một nền tảng</h2>
            <p className="text-muted-foreground text-sm">Kiến thức · Công cụ audit · Lộ trình career</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {solutions.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`bg-card rounded-2xl p-6 flex flex-col relative overflow-hidden ${
                  s.featured
                    ? "border-2 border-teal-500/40 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
                    : "border border-white/5"
                }`}
              >
                {s.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-500 text-teal-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      ⭐ Sản phẩm chính
                    </span>
                  </div>
                )}
                <div className="mt-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit block mb-3 ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{s.desc}</p>
                </div>
                <Link href={s.href}>
                  <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${s.ctaStyle}`}>
                    {s.cta}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCT BANNER ── */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 rounded-2xl p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/8 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="max-w-xl">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 mb-3 block">
                  🔥 Sản phẩm nổi bật
                </span>
                <h3 className="text-2xl font-bold mb-2">GMP Audit Survival Kit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Bộ công cụ đầy đủ nhất để chuẩn bị GMP audit: SOP gap analysis, 10 CAPA templates,
                  50+ interview Q&A scripts, mock audit walkthrough + 30-min 1-on-1 consulting.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["GMP WHO", "Annex 1 EU", "FSSC 22000", "ISO 15189"].map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-center md:text-right">
                <div className="mb-1">
                  <span className="text-sm text-muted-foreground line-through mr-2">$120</span>
                  <span className="text-4xl font-bold text-teal-400">$59</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">one-time • 30-day guarantee</p>
                <Link href="/toolkits/gmp-audit-kit">
                  <button className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20 w-full md:w-auto">
                    Xem chi tiết →
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST / CREDIBILITY ── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Viết bởi người đã ở cả hai phía</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                BioWikiPro được xây dựng bởi Henry — Sales Manager trong ngành Industrial Microbiology,
                làm việc trực tiếp với QC labs của các nhà máy Pharma & F&B Vietnam. Nội dung
                không phải lý thuyết sách vở — mà là thứ Henry thấy teams thực sự cần khi audit đến.
              </p>
              <div className="space-y-3">
                {miniFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-4"
            >
              {[
                { icon: BookOpen, label: "Academy", value: "48 bài học miễn phí", color: "text-emerald-400" },
                { icon: Users, label: "Target", value: "Senior QC/QA Vietnam", color: "text-blue-400" },
                { icon: Star, label: "Coverage", value: "Pharma + F&B + Lab", color: "text-amber-400" },
                { icon: TrendingUp, label: "Goal", value: "Senior → Manager level", color: "text-teal-400" },
              ].map((item) => (
                <div key={item.label} className="bg-card border border-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-4 font-display">
            Bắt đầu ngay hôm nay — miễn phí
          </h2>
          <p className="text-muted-foreground mb-8">
            48 bài học Academy mở hoàn toàn. Không cần thẻ tín dụng.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/academy">
              <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 font-semibold px-6 py-3 rounded-xl transition-all">
                <BookOpen className="w-4 h-4" /> Vào Academy →
              </button>
            </Link>
            <Link href="/toolkits/gmp-audit-kit">
              <button className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20">
                <Package className="w-4 h-4" /> Xem GMP Audit Kit
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
