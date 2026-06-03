/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileUp, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RecruiterCtaProps {
  onUploadCvClick: () => void;
  }

export default function RecruiterCta({ onUploadCvClick }: RecruiterCtaProps) {
  const values = [
    "Quét kỹ năng tức thì",
    "So khớp công việc 99%",
    "Hoàn toàn miễn phí"
  ];

  return (
    <section className="bg-blue-900 overflow-hidden relative py-12 sm:py-16 text-white" id="recruiter-cta-banner">
      {/* Decorative vectors in corners */}
      <div className="absolute top-0 right-0 h-64 w-64 bg-blue-800 rounded-full opacity-40 blur-3xl -z-5 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 h-64 w-64 bg-blue-900 rounded-full opacity-50 blur-3xl -z-5"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="cta-split-row">
          
          {/* Information Block on Left */}
          <div className="md:col-span-8" id="cta-text-col">
            <span className="text-[10px] font-black tracking-widest text-blue-300 uppercase px-3 py-1 rounded-full bg-blue-950 border border-blue-800">
              {'CÔNG NGHỆ A.I ĐỘT PHÁ'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mt-4">
              {'Tải lên CV & Quét A.I tức thì'}
            </h2>
            <p className="text-sm text-blue-105 mt-2 max-w-2xl leading-relaxed text-blue-100">
              {'Công nghệ A.I thông minh của Nexus HR giúp tự động phân tích hồ sơ và so khớp tức thì với hàng ngàn cơ hội việc làm hấp dẫn.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-4" id="cta-vles">
              {values.map((v) => (
                <div key={v} className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button layout on Right */}
          <div className="md:col-span-4 flex justify-start md:justify-end" id="cta-btn-col">
            <button
              onClick={onUploadCvClick}
              className="bg-emerald-450 hover:bg-emerald-400 bg-emerald-500 hover:bg-emerald-450 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-102 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:shadow-xl active:scale-98"
              id="btn-post-job-cta"
            >
              <FileUp className="h-5 w-5 shrink-0" />
              <span>{'TẢI LÊN & QUÉT CV NGAY'}</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
