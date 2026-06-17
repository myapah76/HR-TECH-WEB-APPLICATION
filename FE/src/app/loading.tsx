import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 w-full animate-fade-in">
      <div className="relative flex flex-col items-center justify-center p-10 bg-white border border-slate-150 shadow-xl rounded-3xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

        {/* Glow effect in background */}
        <div className="absolute -inset-10 rounded-full bg-blue-500/5 blur-2xl pointer-events-none"></div>

        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50/50 border border-blue-100/50 shadow-inner">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>

        <h3 className="mt-6 text-sm font-black text-slate-800 tracking-wider uppercase">
          Đang tải nội dung...
        </h3>

        <p className="mt-2 text-xs text-slate-400 font-bold text-center px-4 leading-relaxed">
          Hệ thống đang chuẩn bị dữ liệu, vui lòng chờ trong giây lát.
        </p>

        {/* Small animated scanning line */}
        <div className="w-24 h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
          <div className="w-1/2 h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>
    </div>
  )
}
