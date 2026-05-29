import { useState } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2, ShieldCheck, FileText, ClipboardList,
  MessageSquare, Video, Phone, Star, ChevronDown, ChevronUp,
  Loader2, ArrowRight, Package, BadgeCheck, RefreshCw
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useSEO } from "@/hooks/use-seo";

type ProductType = "gmp_audit_kit";

async function createCheckoutSession(productType: ProductType): Promise<string> {
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to start checkout");
  }
  const { url } = await res.json();
  return url;
}

const includes = [
  { icon: FileText, title: "40-trang PDF Guide", desc: "GMP Audit Survival Framework — từ chuẩn bị đến ngày audit, từng bước cụ thể." },
  { icon: ClipboardList, title: "SOP Gap Analysis Excel", desc: "Template tự động tính % compliance. Điền vào là biết ngay gap nào cần vá." },
  { icon: ShieldCheck, title: "10 CAPA Report Templates", desc: "Mẫu CAPA ready-to-fill cho các nonconformance phổ biến nhất trong GMP audit." },
  { icon: MessageSquare, title: "Audit Interview Q&A Scripts", desc: "50+ câu hỏi auditor hay hỏi nhất — kèm cách trả lời chuẩn cho QC/QA." },
  { icon: Video, title: "Mock Audit Walkthrough", desc: "Video hướng dẫn quy trình audit thực tế từ góc nhìn của auditor." },
  { icon: Phone, title: "Bonus: 30-min Consulting Call", desc: "1-on-1 với Henry (QC/Pharma Sales Expert) — review audit plan của bạn trực tiếp." },
];

const painPoints = [
  {
    emoji: "⏰",
    title: "Audit đến trong 2 tuần, chưa biết bắt đầu từ đâu?",
    desc: "Không có checklist cụ thể, team mỗi người hiểu mỗi kiểu, lead QC thì đang stress cực độ.",
  },
  {
    emoji: "📋",
    title: "SOP thiếu sót nhưng không biết gap nào nghiêm trọng?",
    desc: "Không có tool để đánh giá mức độ compliance, cứ phải đoán cái nào cần ưu tiên.",
  },
  {
    emoji: "😰",
    title: "Auditor hỏi khó, team không biết trả lời thế nào?",
    desc: "Có kiến thức nhưng không biết cách diễn đạt đúng ngôn ngữ GMP — dễ bị mark finding.",
  },
];

const testimonials = [
  {
    name: "Nguyen T.H.",
    title: "QA Manager, Sanofi Vietnam",
    text: "CAPA templates tiết kiệm cho team tôi ít nhất 2 ngày chuẩn bị. Audit WHO lần này không có major finding nào.",
  },
  {
    name: "Le M.K.",
    title: "Senior QC Microbiologist, DHG Pharma",
    text: "SOP Gap Analysis Excel rất thực tế — điền xong là biết ngay cần focus vào đâu trước audit.",
  },
  {
    name: "Tran V.A.",
    title: "QC Supervisor, Imexpharm",
    text: "Interview Q&A scripts giúp cả team tự tin hơn rất nhiều. Auditor hỏi gì cũng có framework để trả lời.",
  },
];

const faqs = [
  {
    q: "Phù hợp với tiêu chuẩn GMP nào?",
    a: "Kit được thiết kế cho GMP WHO, Annex 1 EU GMP, FSSC 22000, và ISO 15189. Phù hợp với nhà máy Dược và F&B tại Việt Nam đang chuẩn bị audit từ cơ quan quản lý hoặc khách hàng quốc tế.",
  },
  {
    q: "Sau khi mua, tôi nhận file bằng cách nào?",
    a: "Sau khi thanh toán xong, email xác nhận kèm download link sẽ được gửi đến địa chỉ email bạn đăng ký. Download link có hiệu lực vĩnh viễn.",
  },
  {
    q: "Tôi là QC mới có dùng được không?",
    a: "Kit được thiết kế cho Senior QC/QA (3+ năm kinh nghiệm). Tuy nhiên QC mới vẫn có thể học được từ Interview Scripts và PDF Guide. SOP Gap Analysis cần kiến thức QMS cơ bản để dùng hiệu quả.",
  },
  {
    q: "Có áp dụng được cho ngành F&B không?",
    a: "Có. Phần FSSC 22000 trong PDF Guide và CAPA templates áp dụng trực tiếp cho nhà máy F&B. SOP Gap Analysis có thể điều chỉnh cho ISO 22000.",
  },
  {
    q: "Chính sách hoàn tiền như thế nào?",
    a: "30-day money-back guarantee. Nếu không hài lòng vì bất kỳ lý do gì trong 30 ngày, email cho chúng tôi — hoàn tiền 100%, không hỏi thêm.",
  },
];

export default function GMPAuditKit() {
  useSEO({
    title: "GMP Audit Survival Kit — Chuẩn bị thanh tra GMP $59",
    description: "Bộ công cụ 6-in-1 giúp QC/QA Pharma vượt qua thanh tra GMP & Annex 1: checklist, câu hỏi khó, CAPA template, mock interview. Chỉ 59 USD.",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isAuthenticated } = useUser();
  const [, navigate] = useLocation();

  async function handleCheckout() {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const url = await createCheckoutSession("gmp_audit_kit");
      window.location.href = url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-4xl mx-auto px-4">

      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-[11px] uppercase font-bold tracking-widest text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full mb-5">
          GMP Audit Survival Kit
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mb-5 font-display leading-tight">
          Sống sót qua GMP Audit —{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Không cần đoán mò
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Bộ công cụ hoàn chỉnh cho Senior QC/QA: SOP gap analysis, CAPA templates, audit interview scripts
          — sẵn sàng dùng ngay từ ngày 1.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/25 disabled:opacity-60 disabled:cursor-wait mb-4"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting…</>
          ) : (
            <><Package className="w-5 h-5" /> Mua ngay — $59</>
          )}
        </button>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-teal-400" /> One-time payment</span>
          <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-teal-400" /> Lifetime access</span>
          <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-teal-400" /> Instant download</span>
          <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-teal-400" /> 30-day money-back</span>
        </div>
      </motion.div>

      {/* ── PAIN POINTS ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8 text-muted-foreground">
          Nghe có quen không?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {painPoints.map((p) => (
            <div key={p.title} className="bg-card border border-white/5 rounded-2xl p-6">
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="font-bold text-sm mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT'S INCLUDED ── */}
      <div className="mb-16 bg-card border border-white/5 rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-2 text-center">Trong Kit có gì?</h2>
        <p className="text-muted-foreground text-sm text-center mb-8">
          6 tài nguyên — giá trị ước tính $120 nếu mua riêng lẻ
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {includes.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8">Họ đã dùng và nói gì</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                "{t.text}"
              </p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING CTA ── */}
      <div className="mb-16 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-500/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent" />
        <div className="relative z-10">
          <p className="text-sm text-teal-400 font-semibold mb-2">Giá ưu đãi ra mắt</p>
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <span className="text-lg text-muted-foreground line-through">$120</span>
            <span className="text-5xl font-bold text-teal-400">$59</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8">One-time payment • Không subscription • Lifetime access</p>

          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl shadow-teal-500/30 disabled:opacity-60 disabled:cursor-wait mb-6"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting…</>
            ) : (
              <>Mua ngay <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>30-day money-back guarantee — không hài lòng, hoàn tiền 100%</span>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>🔒 Stripe Secure Payment</span>
            <span>📦 GMP WHO • Annex 1 EU • FSSC 22000 • ISO 15189</span>
          </div>
        </div>
      </div>

      {/* ── WHO IS THIS FOR ── */}
      <div className="mb-16 bg-card border border-white/5 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Kit này dành cho ai?</h2>
        <div className="space-y-3">
          {[
            "Senior QC/QA Engineer có 3-7 năm kinh nghiệm trong ngành Pharma hoặc F&B",
            "QC Supervisor đang chuẩn bị cho lần audit GMP đầu tiên với tư cách lead",
            "QA Manager cần tài nguyên ready-to-use để train team trước audit",
            "Ai đang làm việc tại nhà máy có deadline audit trong 1-3 tháng tới",
          ].map((line) => (
            <div key={line} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span className="text-sm">{line}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Không phù hợp nếu:</span> Bạn là QC mới dưới 1 năm kinh nghiệm, hoặc nhà máy chưa có hệ thống QMS cơ bản.
          </p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-8">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-sm pr-4">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-4">Còn thắc mắc? Liên hệ trực tiếp.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            {isLoading ? "Redirecting…" : "Mua GMP Audit Kit — $59"}
          </button>
          <a
            href="mailto:thongtran.hcmus@gmail.com"
            className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Hỏi trước khi mua
          </a>
        </div>
      </div>
    </div>
  );
}
