import { KeyRound } from 'lucide-react'

interface JwtTabProps {
  jwtAccessExpiration: number
  setJwtAccessExpiration: (val: number) => void
  jwtRefreshExpiration: number
  setJwtRefreshExpiration: (val: number) => void
  jwtIssuer: string
  setJwtIssuer: (val: string) => void
  jwtAudience: string
  setJwtAudience: (val: string) => void
}

export default function JwtTab({
  jwtAccessExpiration,
  setJwtAccessExpiration,
  jwtRefreshExpiration,
  setJwtRefreshExpiration,
  jwtIssuer,
  setJwtIssuer,
  jwtAudience,
  setJwtAudience,
}: JwtTabProps) {
  return (
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
  )
}
