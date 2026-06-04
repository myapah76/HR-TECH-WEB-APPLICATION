/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { ArrowRight, Star } from 'lucide-react'
import { RECRUITERS } from '../../data'

interface TopEmployersProps {}

export default function TopEmployers({}: TopEmployersProps) {
  return (
    <section className="bg-white py-12 border-b border-gray-50" id="top-employers-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header container */}
        <div className="flex items-end justify-between mb-8" id="top-employers-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                {'Được xác minh'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {'NHÀ TUYỂN DỤNG HÀNG ĐẦU'}
            </h2>
          </div>
          <a
            href="#all-jobs"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group"
            id="link-view-more-employers"
          >
            <span>{'Xem thêm'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Recruiter Logos horizontal row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4" id="employers-grid">
          {RECRUITERS.map((employer) => (
            <div
              key={employer.id}
              className="group relative flex flex-col items-center justify-center p-6 bg-white border border-gray-150 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer h-28"
              id={`employer-card-${employer.id}`}
            >
              <img
                src={employer.logo}
                alt={employer.name}
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                id={`employer-img-${employer.id}`}
              />
              <span className="absolute bottom-2 text-[10px] font-bold text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                {employer.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
