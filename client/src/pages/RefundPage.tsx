import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function RefundPage() {
  useSEO({
    title: "Chính sách Hoàn tiền — BioWikiPro",
    description: "Chính sách hoàn tiền 7 ngày của BioWikiPro — mua không hài lòng, hoàn tiền đầy đủ, không hỏi thêm.",
  });

  return (
    <div className="pb-24 pt-8 max-w-3xl mx-auto px-4">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Trang chủ</Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Chính sách Hoàn tiền</h1>
      <p className="text-muted-foreground text-sm mb-8">Cập nhật lần cuối: 28 tháng 5, 2026</p>

      {/* Highlight box */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Bảo đảm hoàn tiền 7 ngày</h2>
            <p className="text-sm text-muted-foreground">Nếu bạn không hài lòng với bất kỳ sản phẩm trả phí nào trong vòng 7 ngày kể từ ngày mua, chúng tôi sẽ hoàn tiền đầy đủ — không hỏi thêm lý do.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Sản phẩm Áp dụng</h2>
          <p>Chính sách hoàn tiền áp dụng cho tất cả các sản phẩm kỹ thuật số trên BioWikiPro:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>GMP Audit Survival Kit ($59)</li>
            <li>Career Starter Kit ($29)</li>
            <li>Interview Prep Bundle ($39)</li>
            <li>Career Bundle ($59)</li>
            <li>Gói Pro Subscription (tháng đầu tiên)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Điều kiện Hoàn tiền</h2>
          <ul className="list-disc ml-5 space-y-2">
            <li>Yêu cầu phải được gửi trong vòng <strong className="text-foreground">7 ngày</strong> kể từ ngày thanh toán thành công</li>
            <li>Mỗi tài khoản được hoàn tiền tối đa <strong className="text-foreground">1 lần</strong> cho mỗi sản phẩm</li>
            <li>Tài khoản bị phát hiện lạm dụng chính sách hoàn tiền có thể bị từ chối</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Cách Yêu cầu Hoàn tiền</h2>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Gửi email đến <a href="mailto:support@biowikipro.com" className="text-primary hover:underline">support@biowikipro.com</a></li>
            <li>Tiêu đề: <strong className="text-foreground">[Hoàn tiền] Tên sản phẩm</strong></li>
            <li>Nội dung: Email đăng ký tài khoản và ngày mua hàng</li>
            <li>Chúng tôi sẽ xử lý trong vòng <strong className="text-foreground">2–3 ngày làm việc</strong></li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Thời gian Hoàn tiền</h2>
          <p>Sau khi được chấp thuận, khoản hoàn tiền sẽ được xử lý qua Stripe và xuất hiện trên phương thức thanh toán gốc của bạn trong vòng <strong className="text-foreground">5–10 ngày làm việc</strong> (tùy ngân hàng phát hành thẻ).</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Không Áp dụng Hoàn tiền</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Yêu cầu sau 7 ngày kể từ ngày mua</li>
            <li>Gói Pro Subscription sau tháng đầu tiên (đã sử dụng trọn tháng)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Liên hệ Hỗ trợ</h2>
          <p>Có câu hỏi về hoàn tiền? Liên hệ ngay: <a href="mailto:support@biowikipro.com" className="text-primary hover:underline">support@biowikipro.com</a> — chúng tôi phản hồi trong vòng 24 giờ làm việc.</p>
        </section>
      </div>
    </div>
  );
}
