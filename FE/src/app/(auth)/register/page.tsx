'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Đăng ký tài khoản
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Trải nghiệm tìm kiếm việc làm thông minh bằng A.I
              </p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">
                    * Tên
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nam"
                    className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">
                    * Họ
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nguyen Hoang"
                    className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500">
                  * Username
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    placeholder="username"
                    className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500">
                  * Email
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    placeholder="yourname@email.com"
                    className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500">
                  * Mật khẩu
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-auto pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500">
                  * Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-auto pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-1">
                <Label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] font-medium leading-relaxed text-slate-550">
                  <Checkbox className="mt-1 shrink-0" />
                  <span>
                    Tôi đồng ý với Điều khoản Sử dụng và Chính sách Bảo mật của
                    HR-Tech.
                  </span>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
              >
                ĐĂNG KÝ MIỄN PHÍ
              </Button>
            </form>

            <p className="text-center text-[10px] text-slate-400 font-bold mt-7">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 hover:underline font-extrabold"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
