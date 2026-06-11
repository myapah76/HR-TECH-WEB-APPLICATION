/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, ArrowRight } from 'lucide-react'
import { HANDBOOK_ARTICLES } from '@/src/data'
import { HandbookArticle } from '@/src/types'
import Image from 'next/image'

interface CareerHandbooksProps {
  onArticleSelect: (article: HandbookArticle) => void
}

export default function CareerHandbooks({ onArticleSelect }: CareerHandbooksProps) {
  return (
    <section className="bg-gray-50/20 py-14" id="career-handbook-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center mb-10" id="handbook-header">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {'Cẩm Nang Kiến Thức'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-3">
            {'Cẩm nang nghề nghiệp'}
          </h2>
        </div>

        {/* 3-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="handbook-cards-grid">
          {HANDBOOK_ARTICLES.map((art: HandbookArticle) => (
            <article
              key={art.id}
              onClick={() => onArticleSelect(art)}
              className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer group"
              id={`handbook-art-${art.id}`}
            >
              {/* Cover Image */}
              <div className="h-48 overflow-hidden relative">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104"
                />
                <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  {art.category === 'XU HƯỚNG'
                    ? 'XU HƯỚNG'
                    : art.category === 'PHỎNG VẤN'
                      ? 'PHỎNG VẤN'
                      : 'BÍ QUYẾT'}
                </div>
              </div>

              {/* Card Body */}
              <div
                className="p-5 flex-1 flex flex-col justify-between"
                id={`handbook-art-body-${art.id}`}
              >
                <div>
                  <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-700 transition-colors tracking-tight leading-tight line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-2 line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                {/* Meta details */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{art.readTime.replace(' phút đọc', ' phút đọc')}</span>
                  </span>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>{'Đọc tiếp'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Read more slider footer link */}
        <div className="mt-10 text-center" id="handbook-action-row">
          <a
            href="#career-handbook-section"
            className="inline-flex items-center gap-1 text-sm font-extrabold text-blue-600 hover:text-blue-800 transition-colors group"
            id="link-view-all-handbooks"
          >
            <span>{'Khám phá thêm cẩm nang nghề nghiệp'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
