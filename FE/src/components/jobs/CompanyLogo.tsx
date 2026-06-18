import { useState } from 'react'
import Image from 'next/image'

interface CompanyLogoProps {
  url?: string | null
  name: string
}

export function CompanyLogo({ url, name }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  const showFallback = !url || imgError

  return (
    <div className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-white flex items-center justify-center">
      {showFallback ? (
        <div
          className={`w-full h-full bg-linear-to-br flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
        >
          <span className="text-white font-black text-2xl tracking-tight select-none drop-shadow">
            {initial}
          </span>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <Image
            src={url!}
            alt={name}
            fill
            onError={() => setImgError(true)}
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  )
}
