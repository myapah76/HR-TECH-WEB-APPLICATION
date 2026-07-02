import { OtpType } from '@/src/enums/otp.enum'
import { User } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken?: string
  userResponse?: User
  refreshToken?: string
  needsPasswordSetup?: boolean
  setupToken?: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  gender: number
}

export interface RegisterResponse {
  email: string
  expireIn: number
}

export interface ConfirmOtpRequest {
  email: string
  otp: string
  type: OtpType
}

export interface ConfirmOtpResult<T = any> {
  type: string
  data: T
}

export interface ConfirmForgotPasswordOtpResponse {
  resetToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  email: string
  expireIn: number
}

export interface ResetPasswordRequest {
  resetToken: string
  newPassword: string
}

export interface CompanyRegisterRequest {
  email: string
  password: string
  fullName: string
  phone?: string
  name: string
  description?: string
  website?: string
  industry?: string
  size?: string
  address?: string
  taxCode: string
  logoUrl?: string
}

export interface GoogleLoginRequest {
  token: string
}

export interface GoogleLoginResponse {
  needsPasswordSetup?: boolean
  setupToken?: string
  accessToken?: string
  userResponse?: User
  refreshToken?: string
}

export interface SetupPasswordRequest {
  setupToken: string
  newPassword: string
}
