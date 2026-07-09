/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Award } from 'lucide-react'
import Image from 'next/image'

export default function PromoBanners() {
  return (
    <section className="bg-transparent py-12" id="promotional-banners-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="promo-grid">
          {/* LEFT BANNER - HDBank Beach Tree theme */}
          <div
            className="relative h-70 sm:h-85 rounded-3xl overflow-hidden shadow-xl group cursor-pointer border border-slate-100 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300"
            id="promo-banner-left"
          >
            {/* Background image & overlay */}
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
              alt="HDBank Coast Promotion"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-teal-950/85 via-teal-900/40 to-transparent z-10"></div>

            {/* Content Card layout */}
            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between items-start text-white">
              <span className="flex items-center gap-1.5 bg-emerald-550/90 border border-emerald-400/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-emerald-600">
                <Award className="h-3.5 w-3.5" />
                <span>{'NHÀ ĐỒNG HÀNH CHIẾN LƯỢC'}</span>
              </span>

              <div className="max-w-md">
                <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-2 drop-shadow-md">
                  {'Kiến tạo sự nghiệp vững bền cùng HDBank'}
                </h3>
                <p className="text-sm font-semibold text-emerald-50 max-w-sm drop-shadow-xs mb-5 leading-relaxed">
                  {
                    'Cơ hội gia nhập đội ngũ tinh hoa, chế độ đãi ngộ đẳng cấp cùng môi trường tài chính chuyển đổi số hàng đầu.'
                  }
                </p>
                <div className="inline-flex items-center gap-2 bg-white text-emerald-900 font-extrabold text-xs py-2.5 px-5 rounded-xl group-hover:bg-emerald-50 transition-colors shadow-md hover:scale-102 active:scale-98">
                  <span>{'Ứng tuyển ngay'}</span>
                </div>
              </div>
            </div>

            {/* Simulated Roll-up element in bottom corner */}
            <div className="absolute bottom-6 right-6 z-20 bg-amber-500 text-white font-black text-xs py-1 px-3 rounded-lg shadow-md uppercase tracking-wider transform rotate-3 hover:rotate-0 transition-transform hidden sm:block">
              HDBank VIP
            </div>
          </div>

          {/* RIGHT BANNER - EMS EMO healthcare theme */}
          <div
            className="relative h-70 sm:h-85 rounded-3xl overflow-hidden shadow-xl group cursor-pointer border border-slate-100 hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-300"
            id="promo-banner-right"
          >
            {/* Background image & overlay */}
            <Image
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
              alt="Medical Hospital Support"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-rose-950/90 via-rose-900/40 to-transparent z-10"></div>

            {/* Content card layout */}
            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between items-start text-white">
              <span className="flex items-center gap-1.5 bg-rose-600/90 border border-rose-400/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest">
                <Flame className="h-3.5 w-3.5 animate-pulse" />
                <span>{'TUYỂN GẤP Y TẾ & THIẾT BỊ'}</span>
              </span>

              <div className="max-w-md">
                <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-2 drop-shadow-md">
                  {'Chuyên viên EMS & EMO Công nghệ Cao'}
                </h3>
                <p className="text-sm font-semibold text-rose-50 max-w-sm drop-shadow-xs mb-5 leading-relaxed">
                  {
                    'Đồng hành cùng hệ thống y khoa hiện đại. Đi đầu về trang thiết bị tuần hoàn ngoài cơ thể nâng cao sức khỏe cộng đồng.'
                  }
                </p>
                <div className="inline-flex items-center gap-2 bg-white text-rose-950 font-extrabold text-xs py-2.5 px-5 rounded-xl group-hover:bg-rose-50 transition-colors shadow-md hover:scale-102 active:scale-98">
                  <span>{'Khám phá 12 vị trí hot'}</span>
                </div>
              </div>
            </div>

            {/* Custom red cross decoration badge */}
            <div className="absolute bottom-6 right-6 h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg z-20 border border-rose-100 sm:flex">
              <svg className="h-6 w-6 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
