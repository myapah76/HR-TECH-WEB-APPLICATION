'use client'

import { useEffect, useState } from 'react'
import { checkCookiesEnabled } from '@/src/lib/utils'

export function CookieWarningPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show if the browser is strictly blocking cookies
    if (!checkCookiesEnabled()) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  const handleAllowClick = () => {
    // We cannot programmatically change browser security settings.
    alert('Trình duyệt của bạn đang chặn Cookie. Vui lòng mở Cài đặt (Settings) của trình duyệt bạn đang dùng (Chrome, Edge, Safari...), tìm mục Quyền riêng tư/Cookie (Privacy/Cookies) và cho phép lưu Cookie, sau đó F5 tải lại trang.');
  }

  const handleDeclineClick = () => {
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-10 duration-500">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">Cảnh báo: Trình duyệt đang chặn Cookie</h3>
          <p className="text-sm text-slate-600">
            Ứng dụng cần sử dụng Cookie để duy trì trạng thái đăng nhập bảo mật của bạn. 
            Hiện tại hệ thống đang chạy ở chế độ dự phòng (bạn sẽ bị đăng xuất nếu tải lại trang hoặc tắt Cookie hoàn toàn).
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleDeclineClick}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Bỏ qua
          </button>
          <button 
            onClick={handleAllowClick}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          >
            Cho phép Cookie
          </button>
        </div>
      </div>
    </div>
  )
}
