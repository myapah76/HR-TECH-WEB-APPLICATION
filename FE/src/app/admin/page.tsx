'use client'

import StatCard from '@/src/components/ui/StatCard'
import { Users, Briefcase, Building2, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Tổng người dùng" value="12,847" change={8} color="blue" />
        <StatCard
          icon={Briefcase}
          label="Tin tuyển dụng"
          value="3,421"
          change={15}
          color="emerald"
        />
        <StatCard icon={Building2} label="Công ty" value="567" change={5} color="violet" />
        <StatCard
          icon={TrendingUp}
          label="Lượt truy cập/ngày"
          value="45K"
          change={12}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Hoạt động hệ thống
          </h2>
          <div className="space-y-3">
            {[
              { lv: 'Người dùng mới đăng ký', v: '+128 hôm nay' },
              { lv: 'Tin tuyển đăng mới', v: '+34 hôm nay' },
              { lv: 'Đơn ứng tuyển', v: '+256 hôm nay' },
              { lv: 'Lượt quét CV', v: '+89 hôm nay' },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-700">{s.lv}</span>
                <span className="text-xs font-bold text-emerald-600">{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h2 className="text-base font-black text-slate-900 mb-4">Phân bổ người dùng</h2>
          <div className="space-y-3">
            {[
              { lv: 'Ứng viên', v: 10234, p: 80, c: 'bg-blue-600' },
              { lv: 'Nhà tuyển dụng', v: 2489, p: 19, c: 'bg-emerald-600' },
              { lv: 'Quản trị viên', v: 124, p: 1, c: 'bg-violet-600' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{s.lv}</span>
                  <span>
                    {s.v.toLocaleString()} ({s.p}%)
                  </span>
                </div>
                <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`${s.c} h-full rounded-full`} style={{ width: `${s.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
