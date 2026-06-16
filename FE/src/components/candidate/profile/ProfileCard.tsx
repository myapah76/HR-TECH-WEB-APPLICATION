import { User } from '@/src/types/user'
import { Card } from '@/src/components/ui/card'
import { Mail } from 'lucide-react'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm bg-white p-6 flex flex-col items-center text-center">
      <div className="relative group">
        <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-3xl font-black shadow-inner">
          {(user.firstName || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
      <h2 className="mt-4 font-black text-slate-800 text-lg leading-tight">
        {user.lastName} {user.firstName}
      </h2>
      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
        {user.roleResponse?.name === 'CANDIDATE' ? 'Ứng viên' : 'Nhà tuyển dụng'}
      </p>
      <div className="w-full border-t border-slate-100 my-4"></div>
      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 justify-center">
        <Mail className="w-3.5 h-3.5" /> {user.email}
      </p>
    </Card>
  )
}
