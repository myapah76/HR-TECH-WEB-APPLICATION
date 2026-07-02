import { useState } from 'react'
import { Mail, Eye, EyeOff } from 'lucide-react'

interface SmtpTabProps {
  smtpHost: string
  setSmtpHost: (val: string) => void
  smtpPort: number
  setSmtpPort: (val: number) => void
  smtpUsername: string
  setSmtpUsername: (val: string) => void
  smtpPassword: string
  setSmtpPassword: (val: string) => void
  smtpFromEmail: string
  setSmtpFromEmail: (val: string) => void
}

export default function SmtpTab({
  smtpHost,
  setSmtpHost,
  smtpPort,
  setSmtpPort,
  smtpUsername,
  setSmtpUsername,
  smtpPassword,
  setSmtpPassword,
  smtpFromEmail,
  setSmtpFromEmail,
}: SmtpTabProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
