import Link from "next/link"
import { Code, Briefcase, Mail, MapPin, Phone, Share2 } from "lucide-react"

export default function Footer() {
  return (
    <footer
      className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16 transition-colors"
      id="site-footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid divided by cols */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-900 pb-10"
          id="footer-top-grid"
        >
          {/* Logo & Info column on Left */}
          <div
            className="col-span-2 flex flex-col gap-4 text-left"
            id="footer-col-company"
          >
            <Link
              href="/"
              className="text-2xl font-black text-white tracking-tight hover:opacity-90 transition-opacity"
            >
              HR<span className="text-blue-500 font-bold">-Tech</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              Nền tảng tuyển dụng thông minh hàng đầu dành cho kỹ sư phần mềm và quản lý công nghệ tại Việt Nam. Kết nối cơ hội bứt phá.
            </p>
            <div
              className="flex flex-col gap-2.5 mt-2 text-xs font-semibold text-slate-400"
              id="footer-contacts"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-blue-500" /> Keangnam Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-blue-500" /> +84 24 7300 7999
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-blue-500" /> contact@hrtech.vn
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-4" id="f-col-col-cand">
            <h4 className="text-[11px] font-extrabold tracking-wider text-slate-200 uppercase">
              Dành Cho Ứng Viên
            </h4>
            <ul
              className="flex flex-col gap-2.5 text-xs text-slate-400"
              id="f-links-col-cand"
            >
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-cand-0"
                >
                  Việc làm IT mới nhất
                </Link>
              </li>
              <li>
                <Link
                  href="/salary-guide"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-cand-1"
                >
                  Tra cứu lương IT
                </Link>
              </li>
              <li>
                <Link
                  href="/handbook"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-cand-2"
                >
                  Cẩm nang nghề nghiệp
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-cand-3"
                >
                  Sự kiện công nghệ
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4" id="f-col-col-rec">
            <h4 className="text-[11px] font-extrabold tracking-wider text-slate-200 uppercase">
              Dành Cho Nhà Tuyển Dụng
            </h4>
            <ul
              className="flex flex-col gap-2.5 text-xs text-slate-400"
              id="f-links-col-rec"
            >
              <li>
                <Link
                  href="/login?role=recruiter"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-rec-0"
                >
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-rec-1"
                >
                  Tìm kiếm tài năng
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-rec-2"
                >
                  Bảng giá dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-rec-3"
                >
                  Liên hệ tư vấn
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4" id="f-col-col-hlp">
            <h4 className="text-[11px] font-extrabold tracking-wider text-slate-200 uppercase">
              Trung Tâm Hỗ Trợ
            </h4>
            <ul
              className="flex flex-col gap-2.5 text-xs text-slate-400"
              id="f-links-col-hlp"
            >
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-hlp-0"
                >
                  Về HR-Tech
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-hlp-1"
                >
                  Liên hệ hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-hlp-2"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 transition-colors font-semibold"
                  id="f-link-url-col-hlp-3"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Base bottom details */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-550 font-bold"
          id="footer-bottom-row"
        >
          <p>
            © 2026 Công ty Cổ phần Giải pháp Công nghệ HR-Tech. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-4 mt-3 sm:mt-0" id="footer-socials">
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors"
              id="social-linkedin"
            >
              <Briefcase className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors"
              id="social-twitter"
            >
              <Share2 className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors"
              id="social-github"
            >
              <Code className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
