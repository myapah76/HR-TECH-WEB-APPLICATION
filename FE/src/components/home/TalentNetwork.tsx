/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, Globe } from 'lucide-react'
import Image from 'next/image'

export default function TalentNetwork() {
  const partners = [
    {
      id: 'part-1',
      title: 'Hệ Thống Đào Tạo Nexus',
      image:
        'https://images.unsplash.com/photo-1573497491208-6b1acb260532?auto=format&fit=crop&w=350&q=80',
      description: 'Nâng cao giá trị chuyên môn thông qua các khóa huấn luyện tiêu chuẩn.',
    },
    {
      id: 'part-2',
      title: 'VietTravel Partner',
      image:
        'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=350&q=80',
      description: 'Thư giãn nghỉ mát hàng đầu dành cho doanh nghiệp thành viên.',
    },
    {
      id: 'part-3',
      title: 'FIT HR Agency',
      image:
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=350&q=80',
      description: 'Kết nối việc làm cấp cao thông qua mạng lưới chuyên viên săn nhân tài.',
    },
    {
      id: 'part-4',
      title: 'IDG Ventures',
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=350&q=80',
      description: 'Quỹ đầu tư công nghệ đồng hành định hướng tăng trưởng bền vững.',
    },
  ]

  return (
    <section className="bg-white py-14 border-b border-gray-50" id="talent-network-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Intro Section Header */}
        <div className="mb-10 max-w-3xl" id="talent-network-header">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
            {'"Gia tăng cơ hội nghề nghiệp"'}
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            {'khi kết nối cùng các công ty hàng đầu tại '}
            <span className="text-blue-600 font-bold">TalentNetwork</span>
          </p>
        </div>

        {/* 2-Column Split: Map on Left, Partner Grid on Right */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          id="talent-network-grid"
        >
          {/* LEFT COLUMN: Map of Global Network */}
          <div className="lg:col-span-5 relative" id="talent-network-map-col">
            <div className="overflow-hidden rounded-2xl border border-gray-150 shadow-md aspect-4/3 bg-linear-to-br from-amber-50/50 to-orange-50/20 group relative">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                alt="TalentNetwork World Globe"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover filter grayscale hover:grayscale-0 contrast-125 transition-all duration-700 group-hover:scale-102"
              />
              {/* Overlay details */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-gray-900/90 p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-amber-400" />
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    {'Toàn cầu đạt chuẩn quốc tế'}
                  </p>
                </div>
                <h4 className="text-sm font-black">{'Hồ sơ kỹ sư Việt Nam vươn tầm hải ngoại'}</h4>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Grid of Recruiter Cards */}
          <div className="lg:col-span-7" id="talent-network-partners-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="partners-grid-cards">
              {partners.map((pt) => (
                <div
                  key={pt.id}
                  className="bg-gray-50/50 border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                  id={`partner-col-${pt.id}`}
                >
                  <div className="h-32 overflow-hidden relative">
                    <Image
                      src={pt.image}
                      alt={pt.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 bg-white" id={`partner-body-${pt.id}`}>
                    <h4 className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {pt.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1 line-clamp-2 leading-relaxed">
                      {pt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Read more footer action */}
            <div className="mt-6 text-right" id="partners-action-row">
              <a
                href="#all-jobs"
                className="inline-flex items-center gap-1 text-sm font-extrabold text-blue-600 hover:text-blue-800 transition-colors group"
                id="link-view-all-partners"
              >
                <span>{'Xem thêm các đối tác hành trình'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
