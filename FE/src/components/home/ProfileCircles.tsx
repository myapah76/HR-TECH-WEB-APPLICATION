"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExternalLink, Sparkles, User, ShieldCheck } from 'lucide-react';

export default function ProfileCircles() {
  const circles = [
    {
      id: "cir-1",
      title: "Ứng Viên Tài Năng",
      subtitle: "Phân tích NLP xu hướng hồ sơ hàng đầu",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=600&q=80",
      badge: "TALENT ATTRACTION",
      badgeBg: "bg-pink-600"
    },
    {
      id: "cir-2",
      title: "Enterprise Choice",
      subtitle: "Lựa chọn vững chắc của doanh nghiệp lớn",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=600&q=80",
      badge: "ENTERPRISE OF CHOICE",
      badgeBg: "bg-blue-600"
    },
    {
      id: "cir-3",
      title: "Quản lý Cấp cao",
      subtitle: "Kết nối tech-managers toàn diện",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80",
      badge: "TECH LEADERS",
      badgeBg: "bg-indigo-600"
    },
    {
      id: "cir-4",
      title: "Hệ Sinh Thái Xanh",
      subtitle: "Không gian làm việc thịnh vượng bền vững",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=600&q=80",
      badge: "ECOLOGICAL DESIGN",
      badgeBg: "bg-emerald-600"
    }
  ];

  return (
    <section className="bg-white py-12" id="profile-circles-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title / Intro of circles */}
        <div className="text-center mb-10 max-w-xl mx-auto" id="profile-circles-intro">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Giá Trị Khác Biệt
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-3">
            Hợp tác kiến tạo văn hóa doanh nghiệp tối ưu
          </h2>
        </div>

        {/* 4-column Gallery layout with hover transformations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6" id="circles-grid">
          {circles.map((item) => (
            <div 
              key={item.id}
              className="group relative rounded-2xl overflow-hidden aspect-square shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer"
              id={`circle-col-${item.id}`}
            >
              {/* Image & Dark Overlay */}
              <img 
                src={item.image} 
                alt={item.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                id={`circle-img-${item.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10 transition-opacity duration-300"></div>

              {/* Badges and tags */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5" id={`circle-badges-${item.id}`}>
                <span className={`text-[9px] font-black tracking-widest text-white uppercase px-2 py-0.5 rounded-sm shadow-xs ${item.badgeBg}`}>
                  {item.badge}
                </span>
              </div>

              {/* Description Details at bottom */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white flex flex-col justify-end" id={`circle-content-${item.id}`}>
                <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors tracking-tight flex items-center justify-between" id={`circle-title-${item.id}`}>
                  <span>{item.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-300 shrink-0" />
                </h4>
                <p className="text-[10px] font-medium text-gray-300 mt-1 line-clamp-2 leading-relaxed" id={`circle-desc-${item.id}`}>
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
