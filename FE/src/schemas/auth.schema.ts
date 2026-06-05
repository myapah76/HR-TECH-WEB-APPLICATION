import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(5, 'Mật khẩu phải có ít nhất 5 ký tự'),
})

export const registerSchema = z
  .object({
    email: z.email('Email không hợp lệ'),
    username: z.string().min(5, 'Username phải có ít nhất 5 ký tự'),
    firstName: z.string().min(1, 'First name không được để trống'),
    lastName: z.string().min(1, 'Last name không được để trống'),
    gender: z.enum(['0', '1'], {
      message: 'Vui lòng chọn giới tính',
    }),
    password: z.string().min(5, 'Mật khẩu phải có ít nhất 5 ký tự'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: 'Bạn phải đồng ý với Điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP phải có đúng 6 chữ số'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>

export const forgotPasswordSchema = z.object({
  email: z.email('Email không hợp lệ'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(5, 'Mật khẩu phải có ít nhất 5 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
