import { Layout, Database, Server, Smartphone, BarChart3, ClipboardList, LucideIcon } from 'lucide-react'

export interface RoleIconConfig {
  icon: LucideIcon
  colorClass: string
}

const roleIconMappings = [
  {
    keywords: ['frontend'],
    icon: Layout,
    colorClass: 'text-blue-600 dark:text-blue-400'
  },
  {
    keywords: ['backend'],
    icon: Database,
    colorClass: 'text-indigo-650 dark:text-indigo-400'
  },
  {
    keywords: ['devops'],
    icon: Server,
    colorClass: 'text-teal-650 dark:text-teal-400'
  },
  {
    keywords: ['mobile', 'android', 'ios'],
    icon: Smartphone,
    colorClass: 'text-rose-600 dark:text-rose-450'
  },
  {
    keywords: ['data', 'analyst', 'science'],
    icon: BarChart3,
    colorClass: 'text-amber-600 dark:text-amber-400'
  }
]

export const getRoleIconConfig = (name: string): RoleIconConfig => {
  const n = name.toLowerCase()
  const match = roleIconMappings.find(mapping =>
    mapping.keywords.some(keyword => n.includes(keyword))
  )
  return {
    icon: match ? match.icon : ClipboardList,
    colorClass: match ? match.colorClass : 'text-purple-650 dark:text-purple-400'
  }
}
