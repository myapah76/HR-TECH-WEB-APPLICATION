'use client'

import PageHeader from '@/src/components/ui/PageHeader'
import { Settings, Globe, Database, Mail, Save } from 'lucide-react'
import { useState } from 'react'

export default function SystemSettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        icon={Settings}
        title="Cấu hình hệ thống"
        subtitle="Cấu hình toàn cục cho nền tảng HR-Tech"
        actions={
          <button
            onClick={handleSave}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Đã lưu ✓' : 'Lưu cấu hình'}
          </button>
        }
      />
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-blue-600" />
            Cài đặt chung
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Tên trang web</label>
              <input
                type="text"
                defaultValue="HR-Tech"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Ngôn ngữ mặc định</label>
              <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-blue-500 transition-all">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-emerald-600" />
            Cơ sở dữ liệu
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400">Trạng thái</p>
              <p className="text-sm font-black text-emerald-600">Online</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400">Dung lượng</p>
              <p className="text-sm font-black text-slate-800">2.4 GB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-amber-600" />
            Email SMTP
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              defaultValue="smtp.gmail.com"
              placeholder="SMTP Host"
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
            />
            <input
              type="text"
              defaultValue="587"
              placeholder="Port"
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
