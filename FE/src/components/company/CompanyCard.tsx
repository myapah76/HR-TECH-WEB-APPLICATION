'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'motion/react'
import { MapPin, Users, Star, Briefcase } from 'lucide-react'
import { CompanyResponse } from '@/src/types/company'

interface CompanyCardProps {
  company: CompanyResponse
  index: number
}

export default function CompanyCard({ company, index }: CompanyCardProps) {
  const [imgError, setImgError] = useState(false)

  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const bgColors = [
    'bg-emerald-600',
    'bg-blue-600',
    'bg-amber-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-teal-600',
    'bg-indigo-600',
    'bg-cyan-600',
  ]
  const colorIdx = company.name.length % bgColors.length
  const logoBg = bgColors[colorIdx]
  const showLogo = company.logoUrl && !imgError

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/companies/${company.id}`}
        className="block bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 group h-full"
      >
        <div className="flex items-center gap-4 mb-4">
          {showLogo ? (
            <Image
              src={company.logoUrl}
              alt={company.name}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-2xl object-cover border border-slate-100"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`h-14 w-14 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center ${logoBg}`}>
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {company.name}
            </h3>
            <p className="text-xs font-bold text-slate-400">
              {company.website || 'Chưa cập nhật website'}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4">
          {company.description || `Chào mừng bạn đến với ${company.name}. Khám phá các cơ hội nghề nghiệp hấp dẫn ngay hôm nay.`}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
            <MapPin className="h-3 w-3" />
            {company.address ? company.address.split(',').pop()?.trim() : 'Việt Nam'}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
            <Users className="h-3 w-3" />
            Doanh nghiệp
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
            <Star className="h-3 w-3" />
            4.8/5
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
            <Briefcase className="h-3.5 w-3.5" />
            Xem các vị trí đang tuyển
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
