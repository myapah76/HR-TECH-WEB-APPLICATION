import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
})

export type LoginFormData = z.infer<typeof loginSchema>
