import { Globe } from 'lucide-react'

interface GeneralTabProps {
  websiteName: string
  setWebsiteName: (val: string) => void
  maxFileSize: number
  setMaxFileSize: (val: number) => void
}

export default function GeneralTab({
  websiteName,
  setWebsiteName,
  maxFileSize,
  setMaxFileSize,
}: GeneralTabProps) {
  return (
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
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
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
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
