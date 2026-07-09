'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useGetMyCompany, useUpdateCompany, useGetCompanyMembers } from '@/src/hooks/company'
import { useAuthStore } from '@/src/stores/auth.store'
import { uploadToCloudinary } from '@/src/utils'
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ExternalLink,
  Upload,
  Loader2,
  CheckCircle,
  Eye,
  Edit3,
} from 'lucide-react'
import Loading from '@/src/app/loading'

export default function RecruiterCompanyProfilePage() {
  const { user } = useAuthStore()
  const { data: myCompany, isLoading: isCompanyLoading } = useGetMyCompany()
  const { data: companyMembers = [], isLoading: isMembersLoading } = useGetCompanyMembers(
    myCompany?.id
  )
  const currentMember = companyMembers.find((m) => m.userId === user?.id)
  const isOwner = currentMember?.role === 'OWNER'
  const updateCompanyMutation = useUpdateCompany()

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')
  const [industry, setIndustry] = useState('')
  const [size, setSize] = useState('')
  const [description, setDescription] = useState('')

  // Sync state with company data during render
  const [prevMyCompany, setPrevMyCompany] = useState(myCompany)
  if (myCompany !== prevMyCompany) {
    setPrevMyCompany(myCompany)
    if (myCompany) {
      setName(myCompany.name || '')
      setWebsite(myCompany.website || '')
      setAddress(myCompany.address || '')
      setIndustry(myCompany.industry || 'Doanh nghiệp công nghệ')
      setSize(myCompany.size || '100 - 500 nhân sự')
      setDescription(myCompany.description || '')
      setLogoPreview(myCompany.logoUrl || '')
    }
  }

  // Redirect to preview if not owner but on edit tab during render
  if (!isMembersLoading && !isOwner && activeTab === 'edit') {
    setActiveTab('preview')
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!myCompany?.id) {
      toast.error('Không tìm thấy thông tin công ty của bạn!')
      return
    }

    if (!name.trim()) {
      toast.error('Tên công ty không được để trống!')
      return
    }

    setIsUploading(true)
    let uploadedLogoUrl = myCompany.logoUrl

    try {
      if (logoFile) {
        uploadedLogoUrl = await uploadToCloudinary(logoFile, 'hrtech/companies')
      }

      await updateCompanyMutation.mutateAsync({
        id: myCompany.id,
        request: {
          name,
          website,
          address,
          industry,
          size,
          description,
          logoUrl: uploadedLogoUrl,
        },
      })

      toast.success('Cập nhật hồ sơ công ty thành công!')
      setActiveTab('preview')
    } catch (error) {
      console.error('Update company error:', error)
      toast.error('Có lỗi xảy ra khi cập nhật thông tin công ty!')
    } finally {
      setIsUploading(false)
    }
  }

  if (isCompanyLoading || isMembersLoading) {
    return <Loading />
  }

  if (!myCompany) {
    return (
      <div className="text-center py-20 font-sans">
        <h2 className="text-xl font-black text-slate-800">Không tìm thấy thông tin công ty</h2>
      </div>
    )
  }

  // Generate initials for logo placeholder
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'CP'
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
  const colorIdx = name ? name.length % bgColors.length : 0
  const logoBg = bgColors[colorIdx]

  return (
    <div className="pb-12 font-sans">
      {/* Header title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-emerald-600" />
            Hồ sơ công ty
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Quản lý thông tin thương hiệu tuyển dụng của doanh nghiệp.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/40 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem hồ sơ</span>
          </button>
          {isOwner && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'preview' ? (
        // --- PREVIEW MODE ---
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
            <div className="h-40 bg-emerald-600 relative"></div>
            <div className="p-6 flex flex-col md:flex-row items-start gap-6 relative">
              {/* Logo container shifted up */}
              <div className="shrink-0 -mt-20 relative z-10 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-md">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={name}
                    className="h-28 w-28 rounded-xl object-contain bg-white"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                      const sibling = (e.target as HTMLElement).nextElementSibling
                      if (sibling) sibling.removeAttribute('style')
                    }}
                  />
                ) : null}
                <div
                  className={`h-28 w-28 rounded-xl text-white font-black text-3xl flex items-center justify-center shrink-0 ${logoBg}`}
                  style={logoPreview ? { display: 'none' } : undefined}
                >
                  {initials}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                  {name || 'Tên công ty'}
                </h2>
                <p className="text-sm font-bold text-slate-500 mt-1.5">{industry}</p>

                <div className="flex flex-wrap gap-2.5 mt-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-650 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {address ? address.split(',').pop()?.trim() : 'Việt Nam'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-650 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {size}
                  </span>
                  {website && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100/55 transition-colors cursor-pointer"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-emerald-600" /> Giới thiệu công ty
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                  {description ||
                    `Chào mừng bạn đến với ${name}. Chúng tôi liên tục tìm kiếm và chào đón những tài năng mới gia nhập đội ngũ chuyên nghiệp.`}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 mb-4">Phúc lợi công ty</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Môi trường làm việc năng động, sáng tạo',
                    'Đào tạo phát triển kỹ năng liên tục',
                    'Bảo hiểm sức khỏe toàn diện',
                    'Du lịch công ty hàng năm',
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-sm font-medium text-slate-650 bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/40"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-555 shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
                  Thông tin đăng ký
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Mã số thuế
                    </span>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {myCompany.taxCode || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Địa chỉ email
                    </span>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {user?.email || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Điện thoại liên hệ
                    </span>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {user?.phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Trạng thái hồ sơ
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1 uppercase">
                      {myCompany.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- EDIT MODE ---
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 border-b pb-3.5">
              Thông tin công ty
            </h2>

            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="relative shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt={name}
                      className="h-28 w-28 rounded-2xl object-contain border border-slate-200 bg-white p-1"
                    />
                  ) : (
                    <div
                      className={`h-28 w-28 rounded-2xl text-white font-extrabold text-3xl flex items-center justify-center shrink-0 border border-slate-250 ${logoBg}`}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <h3 className="text-sm font-bold text-slate-800">Logo thương hiệu</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Hỗ trợ định dạng PNG, JPG. Dung lượng tối đa 2MB.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-250 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Chọn logo mới
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="VD: Cổ phần Công nghệ Nexus"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Lĩnh vực hoạt động
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    placeholder="VD: Công nghệ thông tin / Thương mại điện tử"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Quy mô nhân sự
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white font-medium"
                  >
                    <option value="10 - 50 nhân sự">10 - 50 nhân sự</option>
                    <option value="50 - 100 nhân sự">50 - 100 nhân sự</option>
                    <option value="100 - 500 nhân sự">100 - 500 nhân sự</option>
                    <option value="500 - 1000 nhân sự">500 - 1000 nhân sự</option>
                    <option value="1000+ nhân sự">1000+ nhân sự</option>
                  </select>
                </div>
              </div>

              {/* Website & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Website công ty
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    placeholder="VD: nexus.vn"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Địa điểm trụ sở chính
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Giới thiệu công ty
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
                  placeholder="Mô tả tóm tắt lịch sử, mục tiêu phát triển và văn hoá làm việc tại doanh nghiệp..."
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3.5">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl border border-slate-250 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thông tin</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
