import { type FormEvent } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /**
   * Nếu truyền, input sẽ được wrap trong <form> và gọi onSubmit khi nhấn Enter.
   * Hữu ích khi search dùng URL params thay vì state real-time.
   */
  onSubmit?: (value: string) => void
  /**
   * Hiển thị nút X để xóa nhanh khi có nội dung.
   * Gọi onChange('') khi nhấn X.
   */
  clearable?: boolean
}

/**
 * Search input dùng chung cho các trang quản lý.
 * - Mặc định: real-time search (onChange mỗi keystroke).
 * - Với `onSubmit`: wrap trong form, tìm khi nhấn Enter.
 * - Với `clearable`: hiển thị nút X để reset.
 */
export default function SearchInput({
  id,
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
  onSubmit,
  clearable = false,
}: SearchInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit?.(value)
  }

  const input = (
    <div className={`relative ${onSubmit ? '' : className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-9 ${clearable ? 'pr-10' : 'pr-4'} py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400`}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Xóa tìm kiếm"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )

  if (onSubmit) {
    return (
      <form onSubmit={handleSubmit} className={className}>
        {input}
      </form>
    )
  }

  return input
}
