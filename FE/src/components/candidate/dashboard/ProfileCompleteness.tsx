'use client'

import Link from 'next/link'
import { User, Phone, MapPin, Image, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { useAuthStore } from '@/src/stores/auth.store'

const profileSteps = [
  { label: 'Họ và tên', icon: User, field: 'firstName' },
  { label: 'Số điện thoại', icon: Phone, field: 'phone' },
  { label: 'Địa chỉ', icon: MapPin, field: 'address' },
  { label: 'Ảnh đại diện', icon: Image, field: 'avatarUrl' },
  { label: 'Ngày sinh', icon: Calendar, field: 'dateOfBirth' },
]

export default function ProfileCompleteness() {
  const { user } = useAuthStore()

  const calculateCompleteness = () => {
    if (!user) return 0
    const fields = [
      user.firstName,
      user.lastName,
      user.phone,
      user.address,
      user.avatarUrl,
      user.dateOfBirth,
    ]
    const filledFields = fields.filter((f) => !!f && f.toString().trim() !== '')
    return Math.round((filledFields.length / fields.length) * 100)
  }

  const completeness = calculateCompleteness()

  const isStepDone = (field: string) => {
    if (!user) return false
    const val = user[field as keyof typeof user]
    return !!val && val.toString().trim() !== ''
  }

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completeness / 100) * circumference

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs h-full flex flex-col justify-between min-h-90">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Hoàn thiện hồ sơ</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-40">
              Hồ sơ đầy đủ giúp bạn nổi bật hơn với nhà tuyển dụng
            </p>
          </div>

          {/* Circular progress */}
          <div className="relative shrink-0 w-18 h-18">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={completeness >= 80 ? '#22c55e' : completeness >= 50 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-slate-800">{completeness}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {completeness === 100 ? (
          <div className="flex flex-col items-center justify-center text-center py-6 flex-1 my-auto">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100/80 animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h4 className="text-sm font-black text-slate-800">Tuyệt vời!</h4>
            <p className="text-xs text-slate-500 mt-2 font-semibold leading-relaxed max-w-52.5">
              Hồ sơ ứng viên của bạn đã hoàn thành 100%. Bạn đã sẵn sàng ứng tuyển các cơ hội việc
              làm tốt nhất!
            </p>
          </div>
        ) : (
          /* Checklist */
          <div className="mt-5 space-y-2.5">
            {profileSteps.map(({ label, icon: Icon, field }) => {
              const done = isStepDone(field)
              return (
                <div
                  key={field}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    done ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                      done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span
                    className={`text-xs font-bold flex-1 ${
                      done ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/candidate/profile"
        className={`mt-5 w-full text-center font-black text-xs uppercase tracking-wider py-3 px-5 rounded-xl transition-all active:scale-98 block ${
          completeness === 100
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {completeness === 100 ? 'Xem hồ sơ của tôi' : 'Cập nhật hồ sơ'}
      </Link>
    </div>
  )
}
