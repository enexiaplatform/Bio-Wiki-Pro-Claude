import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";

export default function TermsPage() {
  useSEO({
    title: "Điều khoản Sử dụng — BioWikiPro",
    description: "Điều khoản sử dụng dịch vụ BioWikiPro — nền tảng kiến thức QC/QA Pharma Vietnam.",
  });

  return (
    <div className="pb-24 pt-8 max-w-3xl mx-auto px-4">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Trang chủ</Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Điều khoản Sử dụng</h1>
      <p className="text-muted-foreground text-sm mb-8">Cập nhật lần cuối: 28 tháng 5, 2026</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">1. Chấp nhận Điều khoản</h2>
          <p>Bằng cách truy cập và sử dụng BioWikiPro ("Dịch vụ"), bạn đồng ý bị ràng buộc bởi các Điều khoản Sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng không sử dụng Dịch vụ.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">2. Mô tả Dịch vụ</h2>
          <p>BioWikiPro cung cấp nền tảng kiến thức chuyên sâu về QC/QA Pharma, bao gồm:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Thư viện bài học GMP, Annex 1, và Microbiology miễn phí</li>
            <li>Công cụ hỗ trợ quyết định QC (CCS Builder, Decision Tree)</li>
            <li>Các bộ tài liệu trả phí (GMP Audit Survival Kit, Career Starter Kit)</li>
            <li>Nội dung về xu hướng thị trường và career roadmap</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">3. Tài khoản Người dùng</h2>
          <p>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập tài khoản của mình. Bạn đồng ý không chia sẻ tài khoản với bên thứ ba. Chúng tôi có quyền chấm dứt tài khoản vi phạm điều khoản này.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">4. Thanh toán và Mua hàng</h2>
          <p>Tất cả giao dịch được xử lý qua Stripe — nền tảng thanh toán bảo mật quốc tế. Giá hiển thị trên trang web bằng USD. Các sản phẩm kỹ thuật số (tài liệu, toolkit) được giao qua email hoặc tải xuống trực tiếp sau khi thanh toán thành công.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">5. Quyền Sở hữu Trí tuệ</h2>
          <p>Toàn bộ nội dung trên BioWikiPro — bao gồm văn bản, hình ảnh, bài học, công cụ — là tài sản trí tuệ của BioWikiPro. Bạn không được sao chép, phân phối, hay bán lại nội dung mà không có sự cho phép bằng văn bản.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">6. Giới hạn Trách nhiệm</h2>
          <p>Nội dung trên BioWikiPro chỉ mang tính chất giáo dục và tham khảo. Chúng tôi không chịu trách nhiệm cho bất kỳ quyết định chuyên môn nào được đưa ra dựa trên nội dung này. Người dùng cần tuân thủ các quy định GMP và hướng dẫn nội bộ của tổ chức mình.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">7. Thay đổi Điều khoản</h2>
          <p>Chúng tôi có quyền cập nhật Điều khoản Sử dụng bất cứ lúc nào. Thay đổi sẽ có hiệu lực ngay khi đăng tải. Việc tiếp tục sử dụng Dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận Điều khoản mới.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">8. Liên hệ</h2>
          <p>Mọi câu hỏi về Điều khoản Sử dụng, vui lòng liên hệ: <a href="mailto:support@biowikipro.com" className="text-primary hover:underline">support@biowikipro.com</a></p>
        </section>
      </div>
    </div>
  );
}
