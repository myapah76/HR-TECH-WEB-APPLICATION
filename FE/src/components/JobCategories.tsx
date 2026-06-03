/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookmarkCheck, Briefcase } from 'lucide-react';
import { CATEGORY_JOBS } from '@/src/data';

interface JobCategoriesProps {
  }

export default function JobCategories({}: JobCategoriesProps) {
  const categories = [
    {
      id: "sales",
      title: "Bán hàng / Kinh doanh",
      headerBg: "bg-blue-50 text-blue-800 border-blue-100",
      jobs: CATEGORY_JOBS.sales_business
    },
    {
      id: "mkt",
      title: "Tiếp thị / Marketing",
      headerBg: "bg-indigo-50 text-indigo-800 border-indigo-100",
      jobs: CATEGORY_JOBS.marketing_creative
    },
    {
      id: "admin",
      title: "Hành chính / Thư ký",
      headerBg: "bg-purple-50 text-purple-800 border-purple-100",
      jobs: CATEGORY_JOBS.admin_hr
    }
  ];

  return (
    <section className="bg-white py-10" id="job-categories-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid divided by streams */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="categories-lists-grid">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              id={`cat-col-${cat.id}`}
            >
              {/* Colored Header panel bar */}
              <div className={`px-5 py-4 border-b font-extrabold text-sm text-center flex items-center justify-center gap-2 ${cat.headerBg}`} id={`cat-header-${cat.id}`}>
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>{cat.title}</span>
              </div>

              {/* Rows stream */}
              <div className="divide-y divide-gray-100" id={`cat-rows-${cat.id}`}>
                {cat.jobs.map((item: { title: string; company: string; link: string }, index: number) => (
                  <div 
                    key={index}
                    className="p-4 hover:bg-gray-50/70 transition-colors flex gap-3.5 items-start cursor-pointer group"
                    id={`cat-item-${cat.id}-${index}`}
                  >
                    {/* Tiny Square placeholder logo */}
                    <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0 text-white font-extrabold text-[10px] uppercase shadow-xs group-hover:bg-blue-600 transition-colors">
                      {item.company.charAt(0)}
                    </div>

                    {/* Job Details metadata */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 group-hover:text-blue-700 transition-colors tracking-tight line-clamp-1 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 line-clamp-1">
                        {item.company}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
