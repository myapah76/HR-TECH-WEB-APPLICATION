import { useState } from 'react'

interface CompanyLogoProps {
  url?: string | null
  name: string
}

const getGradientClass = (name: string) => {
  const code = name.charCodeAt(0) % 5
  switch (code) {
    case 0:
      return 'from-blue-500 to-indigo-600'
    case 1:
      return 'from-emerald-400 to-teal-600'
    case 2:
      return 'from-rose-500 to-pink-600'
    case 3:
      return 'from-amber-400 to-orange-500'
    default:
      return 'from-violet-500 to-purple-600'
  }
}

export function CompanyLogo({ url, name }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  const showFallback = !url || imgError

  return (
    <div className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-white flex items-center justify-center">
      {showFallback ? (
        <div
          className={`w-full h-full bg-linear-to-br ${getGradientClass(name)} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
        >
          <span className="text-white font-black text-2xl tracking-tight select-none drop-shadow">
            {initial}
          </span>
        </div>
      ) : (
        <div className="w-full h-full relative flex items-center justify-center">
          <img
            src={url!}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  )
}
