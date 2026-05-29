import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";

export default function PrivacyPage() {
  useSEO({
    title: "Chính sách Bảo mật — BioWikiPro",
    description: "Chính sách bảo mật dữ liệu của BioWikiPro — cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.",
  });

  return (
    <div className="pb-24 pt-8 max-w-3xl mx-auto px-4">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Trang chủ</Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Chính sách Bảo mật</h1>
      <p className="text-muted-foreground text-sm mb-8">Cập nhật lần cuối: 28 tháng 5, 2026</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">1. Thông tin Chúng tôi Thu thập</h2>
          <p>Khi bạn sử dụng BioWikiPro, chúng tôi có thể thu thập:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong className="text-foreground">Thông tin tài khoản:</strong> Họ tên, địa chỉ email khi đăng ký</li>
            <li><strong className="text-foreground">Thông tin thanh toán:</strong> Được xử lý hoàn toàn bởi Stripe — chúng tôi không lưu trữ thông tin thẻ tín dụng</li>
            <li><strong className="text-foreground">Dữ liệu sử dụng:</strong> Trang đã xem, bài học đã học, công cụ đã dùng</li>
            <li><strong className="text-foreground">Dữ liệu kỹ thuật:</strong> Địa chỉ IP, trình duyệt, thiết bị (ẩn danh)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">2. Cách Chúng tôi Sử dụng Thông tin</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Cung cấp và cải thiện Dịch vụ</li>
            <li>Gửi xác nhận đơn hàng và tài liệu đã mua</li>
            <li>Gửi cập nhật nội dung (có thể hủy đăng ký bất cứ lúc nào)</li>
            <li>Phân tích cách người dùng tương tác với nội dung để cải thiện chất lượng</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">3. Chia sẻ Thông tin</h2>
          <p>Chúng tôi <strong className="text-foreground">không bán</strong> dữ liệu cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin với:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong className="text-foreground">Stripe:</strong> Xử lý thanh toán an toàn</li>
            <li><strong className="text-foreground">Nhà cung cấp email:</strong> Gửi thông báo giao dịch</li>
            <li><strong className="text-foreground">Cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">4. Bảo mật Dữ liệu</h2>
          <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành: mã hóa HTTPS, mật khẩu được hash bằng bcrypt, và giới hạn quyền truy cập dữ liệu nội bộ. Tuy nhiên, không có hệ thống nào đảm bảo an toàn 100%.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">5. Cookie</h2>
          <p>Chúng tôi sử dụng cookie phiên làm việc (session cookies) để duy trì trạng thái đăng nhập của bạn. Không sử dụng cookie theo dõi bên thứ ba cho mục đích quảng cáo.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">6. Quyền của Bạn</h2>
          <p>Bạn có quyền:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Yêu cầu xem hoặc xuất dữ liệu cá nhân của mình</li>
            <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu</li>
            <li>Hủy đăng ký nhận email marketing bất cứ lúc nào</li>
          </ul>
          <p className="mt-2">Liên hệ: <a href="mailto:support@biowikipro.com" className="text-primary hover:underline">support@biowikipro.com</a></p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">7. Lưu trữ Dữ liệu</h2>
          <p>Dữ liệu tài khoản được lưu trữ trên máy chủ PostgreSQL được bảo mật. Khi bạn xóa tài khoản, dữ liệu sẽ được xóa trong vòng 30 ngày.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">8. Liên hệ</h2>
          <p>Mọi câu hỏi về Chính sách Bảo mật: <a href="mailto:support@biowikipro.com" className="text-primary hover:underline">support@biowikipro.com</a></p>
        </section>
      </div>
    </div>
  );
}
