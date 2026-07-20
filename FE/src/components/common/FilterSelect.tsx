import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface FilterSelectOption<T extends string = string> {
  value: T
  label: string
}

interface FilterSelectProps<T extends string = string> {
  id?: string
  value: T
  onChange: (value: T) => void
  options: FilterSelectOption<T>[]
  /** Icon hiển thị bên trái select. Mặc định không có icon. */
  icon?: LucideIcon
  /** Placeholder option đầu tiên (khi value = ''). Nếu không truyền thì không render. */
  placeholder?: string
  className?: string
  /** Nội dung thêm bên trong select (VD: option group). Hiếm dùng. */
  children?: ReactNode
}

/**
 * Dropdown filter dùng chung cho các trang quản lý.
 * Tự động render icon bên trái và ChevronDown bên phải.
 */
export default function FilterSelect<T extends string = string>({
  id,
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
  className = '',
}: FilterSelectProps<T>) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-9 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all`}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}
