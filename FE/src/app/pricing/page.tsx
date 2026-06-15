'use client'

import { useState, useEffect } from 'react'
import { Check, Star, Building2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import { getAllActive } from '@/src/services/subscription.service'
import { PlanType } from '@/src/enums/subcriptionPlan.enum'
import { useQuery } from '@tanstack/react-query'

export default function PricingPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'hr' | 'candidate'>('candidate')
  const router = useRouter()

  const { data: res, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getAllActive,
  })

  const plans = res?.data || []

  useEffect(() => {
    if (user) {
      if (user.roleResponse?.name === RoleUser.CANDIDATE) {
        setActiveTab('candidate')
      } else if (user.roleResponse?.name === RoleUser.HR) {
        setActiveTab('hr')
      }
    }
  }, [user])

  const handleSubscribe = (packageId: string, type: 'hr' | 'candidate') => {
    if (!user) {
      router.push('/login')
      return
    }

    console.log(`Tiến hành mua gói ${packageId} dành cho ${type}`)
  }

  const hrPackages = plans.filter((p) => p.planType === PlanType.HR)
  const candidatePackages = plans.filter((p) => p.planType === PlanType.CANDIDATE)

  const rawPackages = activeTab === 'candidate' ? candidatePackages : hrPackages

  const packages = rawPackages.map((pkg) => {
    const isPopular =
      pkg.name.toLowerCase().includes('premium') ||
      pkg.name.toLowerCase().includes('chuyên nghiệp') ||
      pkg.name.toLowerCase().includes('pro')
    const buttonText = pkg.price === 0 ? 'Sử dụng miễn phí' : 'Nâng cấp ngay'

    let period = ''
    if (pkg.durationDays > 0) {
      if (pkg.durationDays === 30) period = '/tháng'
      else if (pkg.durationDays === 365) period = '/năm'
      else period = `/${pkg.durationDays} ngày`
    }

    return {
      id: pkg.id,
      name: pkg.name,
      price:
        pkg.price === 0
          ? 'Miễn phí'
          : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              pkg.price
            ),
      period,
      description: pkg.description,
      features: pkg.features || [],
      isPopular,
      buttonText,
    }
  })
  const showTabs = !user || user.roleResponse?.name === RoleUser.ADMIN_SYSTEM

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Bảng giá linh hoạt cho <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            mọi nhu cầu của bạn
          </span>
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Chọn gói dịch vụ phù hợp nhất để tối ưu hóa quá trình tuyển dụng hoặc tìm việc của bạn.
        </p>
      </div>

      {/* Tabs / Toggle */}
      {showTabs && (
        <div className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex relative overflow-hidden">
            <button
              onClick={() => setActiveTab('candidate')}
              className={`relative z-10 flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'candidate'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-4.5 h-4.5" />
              Dành cho Ứng Viên
            </button>
            <button
              onClick={() => setActiveTab('hr')}
              className={`relative z-10 flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'hr'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4.5 h-4.5" />
              Dành cho Doanh Nghiệp
            </button>

            {/* Active Tab Background Animation */}
            <div
              className={`absolute top-1.5 bottom-1.5 bg-blue-600 rounded-xl transition-all duration-300 ease-out shadow-md`}
              style={{
                left: activeTab === 'candidate' ? '0.375rem' : '50.5%',
                width: activeTab === 'candidate' ? '48.5%' : '48.5%',
              }}
            />
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div
          className={`max-w-7xl mx-auto grid gap-8 transition-all duration-500 ${
            activeTab === 'hr' ? 'lg:grid-cols-3' : 'lg:grid-cols-2 max-w-4xl'
          }`}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-3xl p-8 border transition-all duration-300 hover:shadow-xl ${
                pkg.isPopular
                  ? 'border-blue-500 shadow-blue-100 shadow-2xl lg:-translate-y-4 z-10'
                  : 'border-slate-200 shadow-sm hover:border-slate-300 hover:-translate-y-1'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black px-5 py-2 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" /> Phổ biến nhất
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-2">{pkg.name}</h3>
                <p className="text-sm text-slate-500 font-medium min-h-[40px] leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {pkg.price}
                  </span>
                  {pkg.period && (
                    <span className="text-slate-500 font-bold text-sm">{pkg.period}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(pkg.id, activeTab)}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  pkg.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pkg.buttonText}
              </button>

              <div className="mt-10">
                <p className="text-xs font-black text-slate-900 mb-5 uppercase tracking-widest text-center">
                  Quyền lợi bao gồm
                </p>
                <ul className="space-y-4">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-600 font-medium leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
