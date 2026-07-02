import { useState } from 'react'
import { Cloud, Eye, EyeOff } from 'lucide-react'

interface CloudinaryTabProps {
  cloudinaryCloudName: string
  setCloudinaryCloudName: (val: string) => void
  cloudinaryApiKey: string
  setCloudinaryApiKey: (val: string) => void
  cloudinaryApiSecret: string
  setCloudinaryApiSecret: (val: string) => void
}

export default function CloudinaryTab({
  cloudinaryCloudName,
  setCloudinaryCloudName,
  cloudinaryApiKey,
  setCloudinaryApiKey,
  cloudinaryApiSecret,
  setCloudinaryApiSecret,
}: CloudinaryTabProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Cloud className="h-4.5 w-4.5 text-blue-500" />
          Lưu trữ Cloudinary
        </h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-1">
          Đồng bộ bộ khóa đám mây để lưu trữ ảnh đại diện, logo công ty và hồ sơ CV ứng tuyển.
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={cloudinaryApiSecret}
                onChange={(e) => setCloudinaryApiSecret(e.target.value)}
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
    </div>
  )
}
