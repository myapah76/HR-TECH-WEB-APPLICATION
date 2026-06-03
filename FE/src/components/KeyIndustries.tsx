/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calculator, Landmark, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { KEY_INDUSTRIES } from '@/src/data';

interface KeyIndustriesProps {
  onSelectCategory: (categoryName: string) => void;
  }

export default function KeyIndustries({ onSelectCategory }: KeyIndustriesProps) {
  // Map index or id to professional styled icons
  const getIcon = (id: string) => {
    switch (id) {
      case 'ind-1':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'ind-2':
        return <Calculator className="h-5 w-5 text-indigo-600" />;
      case 'ind-3':
        return <ShoppingBag className="h-5 w-5 text-amber-600" />;
      case 'ind-4':
        return <TrendingUp className="h-5 w-5 text-teal-600" />;
      case 'ind-5':
        return <Landmark className="h-5 w-5 text-rose-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTranslatedName = (name: string, nameEn?: string) => {
    return name;
    return nameEn || name;
  };

  return (
    <section className="bg-gray-50/30 py-12 border-t border-b border-gray-100" id="key-industries-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-8" id="key-industries-header">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {'Ngành Nghề Trọng Điểm'}
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 font-bold uppercase tracking-wider">
            {'KHÁM PHÁ CÁC VỊ TRÍ PHÙ HỢP NHẤT CHO BẢN THÂN'}
          </p>
        </div>

        {/* 5-column balanced flex/grid row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="industries-cards-grid">
          {KEY_INDUSTRIES.map((ind) => (
            <div
              key={ind.id}
              onClick={() => onSelectCategory(ind.name)}
              className="group bg-white border border-gray-200 hover:border-blue-400 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              id={`industry-card-${ind.id}`}
            >
              {/* Circular Icon layout */}
              <div className="h-12 w-12 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center border border-gray-100 group-hover:border-blue-100 transition-colors shadow-inner" id={`industry-icon-${ind.id}`}>
                {getIcon(ind.id)}
              </div>

              {/* Title and stats */}
              <h3 className="text-xs font-black text-gray-900 mt-3 group-hover:text-blue-700 transition-colors line-clamp-1" id={`industry-title-${ind.id}`}>
                {getTranslatedName(ind.name, ind.nameEn)}
              </h3>
              <p className="text-[10px] font-extrabold text-blue-500 bg-blue-50/80 px-2 py-0.5 rounded-full mt-2" id={`industry-count-${ind.id}`}>
                ({ind.count.toLocaleString()} {'việc làm'})
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
