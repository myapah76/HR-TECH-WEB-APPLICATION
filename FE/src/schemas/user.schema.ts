import * as z from 'zod'

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Tên không được để trống'),
  lastName: z.string().optional(),
  username: z.string().min(1, 'Username không được để trống'),
  phone: z.string().optional(),
  address: z.string().optional(),
  gender: z.string(),
  dateOfBirth: z.string().min(1, 'Ngày sinh không được để trống'),
})

export const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export type ProfileFormData = z.infer<typeof profileSchema>
export type PasswordFormData = z.infer<typeof passwordSchema>
