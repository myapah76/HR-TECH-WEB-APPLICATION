import { Database } from 'lucide-react'

interface DatabaseTabProps {
  dbOnline: boolean
  dbSize: string
}

export default function DatabaseTab({ dbOnline, dbSize }: DatabaseTabProps) {
  return (
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
            <p
              className={`text-sm font-black mt-0.5 ${
                dbOnline ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {dbOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/40 border border-slate-200/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Kích thước cơ sở dữ liệu
            </p>
            <p className="text-sm font-black text-slate-800 mt-0.5">
              {dbSize || 'Không xác định'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
