'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/src/components/ui/PageHeader'
import {
  Settings,
  Globe,
  Database,
  Mail,
  KeyRound,
  Cloud,
  CreditCard,
  Save,
  Loader2,
} from 'lucide-react'
import { useGetSystemConfig, useUpdateSystemConfig } from '@/src/hooks/system'
import { toast } from 'sonner'
import Loading from '@/src/app/loading'

// Import Sub-components
import GeneralTab from '@/src/components/admin/settings/GeneralTab'
import SmtpTab from '@/src/components/admin/settings/SmtpTab'
import JwtTab from '@/src/components/admin/settings/JwtTab'
import CloudinaryTab from '@/src/components/admin/settings/CloudinaryTab'
import PayosTab from '@/src/components/admin/settings/PayosTab'
import DatabaseTab from '@/src/components/admin/settings/DatabaseTab'

type TabType = 'general' | 'smtp' | 'jwt' | 'cloudinary' | 'payos' | 'database'

export default function SystemSettingsPage() {
  const { data: config, isLoading } = useGetSystemConfig()
  const updateMutation = useUpdateSystemConfig()

  const [activeTab, setActiveTab] = useState<TabType>('general')

  // Form States
  const [websiteName, setWebsiteName] = useState('')
  const [maxFileSize, setMaxFileSize] = useState(10)

  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUsername, setSmtpUsername] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFromEmail, setSmtpFromEmail] = useState('')

  const [jwtAccessExpiration, setJwtAccessExpiration] = useState(60)
  const [jwtRefreshExpiration, setJwtRefreshExpiration] = useState(30)
  const [jwtIssuer, setJwtIssuer] = useState('')
  const [jwtAudience, setJwtAudience] = useState('')

  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('')
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('')
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('')

  const [payosClientId, setPayosClientId] = useState('')
  const [payosApiKey, setPayosApiKey] = useState('')
  const [payosChecksumKey, setPayosChecksumKey] = useState('')

  // Sync state with fetched database config
  useEffect(() => {
    if (config) {
      setWebsiteName(config.websiteName || '')
      setMaxFileSize(config.maxFileSize ?? 10)
      setSmtpHost(config.smtpHost || '')
      setSmtpPort(config.smtpPort ?? 587)
      setSmtpUsername(config.smtpUsername || '')
      setSmtpPassword(config.smtpPassword || '')
      setSmtpFromEmail(config.smtpFromEmail || '')
      setJwtAccessExpiration(config.jwtAccessExpirationMinutes ?? 60)
      setJwtRefreshExpiration(config.jwtRefreshTokenExpirationDays ?? 30)
      setJwtIssuer(config.jwtIssuer || '')
      setJwtAudience(config.jwtAudience || '')
      setCloudinaryCloudName(config.cloudinaryCloudName || '')
      setCloudinaryApiKey(config.cloudinaryApiKey || '')
      setCloudinaryApiSecret(config.cloudinaryApiSecret || '')
      setPayosClientId(config.payosClientId || '')
      setPayosApiKey(config.payosApiKey || '')
      setPayosChecksumKey(config.payosChecksumKey || '')
    }
  }, [config])

  const handleSave = () => {
    if (!websiteName.trim()) {
      toast.error('Tên trang web không được để trống')
      return
    }

    updateMutation.mutate(
      {
        websiteName,
        maxFileSize,
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword,
        smtpFromEmail,
        jwtAccessExpirationMinutes: jwtAccessExpiration,
        jwtRefreshTokenExpirationDays: jwtRefreshExpiration,
        jwtIssuer,
        jwtAudience,
        cloudinaryCloudName,
        cloudinaryApiKey,
        cloudinaryApiSecret,
        payosClientId,
        payosApiKey,
        payosChecksumKey,
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật cấu hình hệ thống thành công!')
        },
      }
    )
  }

  // Navigation tab helper
  const tabItem = (
    type: TabType,
    label: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all w-full cursor-pointer text-left ${
        activeTab === type
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        icon={Settings}
        title="Cấu hình hệ thống"
        subtitle="Cấu hình toàn cục cho các tài nguyên nền tảng HR-Tech"
        actions={
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-60 shrink-0 bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
            Danh mục cấu hình
          </p>
          {tabItem('general', 'Cài đặt chung', Globe)}
          {tabItem('smtp', 'Cấu hình SMTP Email', Mail)}
          {tabItem('jwt', 'Bảo mật & JWT Token', KeyRound)}
          {tabItem('cloudinary', 'Lưu trữ Cloudinary', Cloud)}
          {tabItem('payos', 'Thanh toán PayOS', CreditCard)}
          {tabItem('database', 'Hệ thống & Database', Database)}
        </div>

        {/* Right Active Configuration Panel */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs min-h-[380px]">
          {activeTab === 'general' && (
            <GeneralTab
              websiteName={websiteName}
              setWebsiteName={setWebsiteName}
              maxFileSize={maxFileSize}
              setMaxFileSize={setMaxFileSize}
            />
          )}

          {activeTab === 'smtp' && (
            <SmtpTab
              smtpHost={smtpHost}
              setSmtpHost={setSmtpHost}
              smtpPort={smtpPort}
              setSmtpPort={setSmtpPort}
              smtpUsername={smtpUsername}
              setSmtpUsername={setSmtpUsername}
              smtpPassword={smtpPassword}
              setSmtpPassword={setSmtpPassword}
              smtpFromEmail={smtpFromEmail}
              setSmtpFromEmail={setSmtpFromEmail}
            />
          )}

          {activeTab === 'jwt' && (
            <JwtTab
              jwtAccessExpiration={jwtAccessExpiration}
              setJwtAccessExpiration={setJwtAccessExpiration}
              jwtRefreshExpiration={jwtRefreshExpiration}
              setJwtRefreshExpiration={setJwtRefreshExpiration}
              jwtIssuer={jwtIssuer}
              setJwtIssuer={setJwtIssuer}
              jwtAudience={jwtAudience}
              setJwtAudience={setJwtAudience}
            />
          )}

          {activeTab === 'cloudinary' && (
            <CloudinaryTab
              cloudinaryCloudName={cloudinaryCloudName}
              setCloudinaryCloudName={setCloudinaryCloudName}
              cloudinaryApiKey={cloudinaryApiKey}
              setCloudinaryApiKey={setCloudinaryApiKey}
              cloudinaryApiSecret={cloudinaryApiSecret}
              setCloudinaryApiSecret={setCloudinaryApiSecret}
            />
          )}

          {activeTab === 'payos' && (
            <PayosTab
              payosClientId={payosClientId}
              setPayosClientId={setPayosClientId}
              payosApiKey={payosApiKey}
              setPayosApiKey={setPayosApiKey}
              payosChecksumKey={payosChecksumKey}
              setPayosChecksumKey={setPayosChecksumKey}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseTab
              dbOnline={config?.dbOnline ?? false}
              dbSize={config?.dbSize || 'Không xác định'}
            />
          )}
        </div>
      </div>
    </div>
  )
}
