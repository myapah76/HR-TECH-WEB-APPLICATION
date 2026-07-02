'use client'

import { useState } from 'react'
import PageHeader from '@/src/components/ui/PageHeader'
import {
  Settings,
  Globe,
  Database,
  Mail,
  KeyRound,
  Cloud,
  CreditCard,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

type TabType = 'general' | 'smtp' | 'jwt' | 'cloudinary' | 'payos' | 'database'

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [isSaving, setIsSaving] = useState(false)

  // Mock Form States (initialized with defaults from application.properties)
  const [websiteName, setWebsiteName] = useState('HR-Tech')
  const [maxFileSize, setMaxFileSize] = useState(10)

  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUsername, setSmtpUsername] = useState('sender@gmail.com')
  const [smtpPassword, setSmtpPassword] = useState('••••••••••••')
  const [smtpFromEmail, setSmtpFromEmail] = useState('noreply@hrtech.com')

  const [jwtAccessExpiration, setJwtAccessExpiration] = useState(60)
  const [jwtRefreshExpiration, setJwtRefreshExpiration] = useState(30)
  const [jwtIssuer, setJwtIssuer] = useState('hrtech-issuer')
  const [jwtAudience, setJwtAudience] = useState('hrtech-audience')

  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('hrtech-cloud')
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('834928492048294')
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('••••••••••••')

  const [payosClientId, setPayosClientId] = useState('payos-client-id-123')
  const [payosApiKey, setPayosApiKey] = useState('payos-api-key-456')
  const [payosChecksumKey, setPayosChecksumKey] = useState('••••••••••••')

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Cập nhật cấu hình hệ thống thành công!')
    }, 1200)
  }

  // Navigation tab helper
  const tabItem = (
    type: TabType,
    label: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all w-full cursor-pointer text-left ${
        activeTab === type
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        icon={Settings}
        title="Cấu hình hệ thống"
        subtitle="Cấu hình toàn cục cho các tài nguyên nền tảng HR-Tech"
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-60 shrink-0 bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
            Danh mục cấu hình
          </p>
          {tabItem('general', 'Cài đặt chung', Globe)}
          {tabItem('smtp', 'Cấu hình SMTP Email', Mail)}
          {tabItem('jwt', 'Bảo mật & JWT Token', KeyRound)}
          {tabItem('cloudinary', 'Lưu trữ Cloudinary', Cloud)}
          {tabItem('payos', 'Thanh toán PayOS', CreditCard)}
          {tabItem('database', 'Hệ thống & Database', Database)}
        </div>

        {/* Right Active Configuration Panel */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs min-h-[380px]">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-blue-600" />
                  Cài đặt chung
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Quản lý tên hiển thị website và dung lượng tệp tin tải lên.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Tên trang web
                  </label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    File Upload tối đa (MB)
                  </label>
                  <input
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMTP EMAIL */}
          {activeTab === 'smtp' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Mail className="h-4.5 w-4.5 text-amber-500" />
                  Cấu hình SMTP Email
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Thiết lập máy chủ gửi thư để cấp mã OTP đăng ký và khôi phục tài khoản.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    SMTP Server Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Email gửi đi mặc định
                  </label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Tài khoản (Username)
                  </label>
                  <input
                    type="text"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Mật khẩu ứng dụng (App Password)
                  </label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & JWT */}
          {activeTab === 'jwt' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-4.5 w-4.5 text-violet-600" />
                  Bảo mật & JWT Token
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Cấu hình hạn thời gian sống của các token truy cập và các thông tin ký mã hóa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Hạn Access Token (phút)
                  </label>
                  <input
                    type="number"
                    value={jwtAccessExpiration}
                    onChange={(e) => setJwtAccessExpiration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Hạn Refresh Token (ngày)
                  </label>
                  <input
                    type="number"
                    value={jwtRefreshExpiration}
                    onChange={(e) => setJwtRefreshExpiration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    JWT Issuer
                  </label>
                  <input
                    type="text"
                    value={jwtIssuer}
                    onChange={(e) => setJwtIssuer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    JWT Audience
                  </label>
                  <input
                    type="text"
                    value={jwtAudience}
                    onChange={(e) => setJwtAudience(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUDINARY */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Cloud className="h-4.5 w-4.5 text-blue-500" />
                  Lưu trữ Cloudinary
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Đồng bộ bộ khóa đám mây để lưu trữ ảnh đại diện, logo công ty và hồ sơ CV ứng
                  tuyển.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Cloud Name
                  </label>
                  <input
                    type="text"
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={cloudinaryApiKey}
                      onChange={(e) => setCloudinaryApiKey(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      API Secret
                    </label>
                    <input
                      type="password"
                      value={cloudinaryApiSecret}
                      onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAYOS */}
          {activeTab === 'payos' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-emerald-600" />
                  Cổng thanh toán PayOS
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Đồng bộ mã kết nối PayOS để hỗ trợ CANDIDATE/RECRUITER thanh toán mua các gói dịch
                  vụ.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={payosClientId}
                    onChange={(e) => setPayosClientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={payosApiKey}
                      onChange={(e) => setPayosApiKey(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Checksum Key
                    </label>
                    <input
                      type="password"
                      value={payosChecksumKey}
                      onChange={(e) => setPayosChecksumKey(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-emerald-600" />
                  Hệ thống & Database
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Theo dõi trạng thái và dung lượng lưu trữ của cơ sở dữ liệu PostgreSQL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Kết nối PostgreSQL
                    </p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">Online</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-55/40 border border-slate-200/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Kích thước cơ sở dữ liệu
                    </p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">34 MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
