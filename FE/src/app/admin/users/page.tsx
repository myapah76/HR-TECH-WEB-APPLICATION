'use client'

import PageHeader from '@/src/components/ui/PageHeader'
import Badge from '@/src/components/ui/Badge'
import { Users, Edit, Trash2, Shield } from 'lucide-react'

export default function UsersPage() {
  const users = [
    { n: 'Nguyễn Hoàng Nam', e: 'nam@email.com', r: 'candidate', s: 'active' },
    { n: 'Nexus HR Recruiter', e: 'hr@nexus.vn', r: 'recruiter', s: 'active' },
    { n: 'Trần Minh Anh', e: 'anh@email.com', r: 'candidate', s: 'active' },
    { n: 'Admin Master', e: 'admin@hrtech.vn', r: 'admin', s: 'active' },
    { n: 'Lê Văn Đức', e: 'duc@email.com', r: 'candidate', s: 'suspended' },
  ]

  return (
    <div className="max-w-5xl">
      <PageHeader
        icon={Users}
        title="Quản lý người dùng"
        subtitle={`${users.length} người dùng trong hệ thống`}
      />
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="p-4">Người dùng</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4">
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">{u.n}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{u.e}</p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant={u.r === 'admin' ? 'info' : u.r === 'recruiter' ? 'success' : 'default'}
                    size="md"
                  >
                    <Shield className="h-3 w-3 inline mr-1" />
                    {u.r}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant={u.s === 'active' ? 'success' : 'danger'} size="md">
                    {u.s === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
