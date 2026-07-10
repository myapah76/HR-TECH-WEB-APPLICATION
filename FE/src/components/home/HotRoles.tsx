import { useRouter } from 'next/navigation'
import { Layout, Database, Server, Smartphone, BarChart3, ClipboardList } from 'lucide-react'

interface HotRole {
  name: string
  jobCount: number
}

interface HotRolesProps {
  roles: HotRole[]
}

const getRoleIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('frontend')) {
    return <Layout className="h-6 w-6 text-blue-600 dark:text-blue-400" />
  }
  if (n.includes('backend')) {
    return <Database className="h-6 w-6 text-indigo-655 dark:text-indigo-400" />
  }
  if (n.includes('devops')) {
    return <Server className="h-6 w-6 text-teal-650 dark:text-teal-400" />
  }
  if (n.includes('mobile')) {
    return <Smartphone className="h-6 w-6 text-rose-600 dark:text-rose-450" />
  }
  if (n.includes('data')) {
    return <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
  }
  return <ClipboardList className="h-6 w-6 text-purple-650 dark:text-purple-400" />
}

export default function HotRoles({ roles }: HotRolesProps) {
  const router = useRouter()

  const handleRoleClick = (roleName: string) => {
    // If it's Frontend Developer, search for "Frontend"
    const keyword = roleName.replace('Developer', '').replace('Engineer', '').trim()
    router.push(`/jobs?keyword=${encodeURIComponent(keyword)}`)
  }

  return (
    <section className="bg-white dark:bg-slate-900 py-12 transition-colors" id="hot-roles-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-8" id="hot-roles-header">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {'VỊ TRÍ CÔNG VIỆC HOT'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
            {'ỨNG TUYỂN DỄ DÀNG THEO ĐỊNH HƯỚNG VAI TRÒ'}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="roles-cards-grid">
          {roles.map((role, index) => (
            <div
              key={index}
              onClick={() => handleRoleClick(role.name)}
              className="group bg-white dark:bg-slate-850/40 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 flex items-center gap-5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md dark:hover:shadow-slate-950/20 transition-all duration-300 cursor-pointer"
              id={`role-card-${index}`}
            >
              <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/20 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/60 group-hover:border-blue-100 dark:group-hover:border-blue-900/40 transition-colors">
                {getRoleIcon(role.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-gray-800 dark:text-slate-205 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-tight">
                  {role.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
                  {role.jobCount} {'việc làm đang tuyển'}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
