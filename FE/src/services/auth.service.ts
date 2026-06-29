import { api, apiRaw } from '@/src/lib/axios'
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ConfirmOtpRequest,
  ConfirmForgotPasswordOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  CompanyRegisterRequest,
  GoogleLoginRequest,
  GoogleLoginResponse,
  SetupPasswordRequest,
} from '@/src/types/auth'
import { ApiResponse } from '@/src/types/api'
import { checkCookiesEnabled } from '../utils'

export const loginWithGoogle = async (data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false'
  }
  const response = await api.post('/auth/google', data, { headers })
  return response.data
}

export const setupGooglePassword = async (data: SetupPasswordRequest): Promise<ApiResponse<LoginResponse>> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false'
  }
  const response = await api.post('/auth/setup-password', data, { headers })
  return response.data
}

export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false'
  }
  const response = await api.post('/auth/login', data, { headers })
  return response.data
}

export const registerUser = async (
  data: RegisterRequest
): Promise<ApiResponse<RegisterResponse>> => {
  const response = await api.post('/auth/register', data)
  return response.data
}

export const registerCompany = async (
  data: CompanyRegisterRequest
): Promise<ApiResponse<RegisterResponse>> => {
  const response = await api.post('/companies/register', data)
  return response.data
}

export const confirmRegisterOtp = async (
  data: ConfirmOtpRequest
): Promise<ApiResponse<unknown>> => {
  const response = await api.post('/auth/confirm-otp', data)
  return response.data
}

export const confirmForgotPasswordOtp = async (
  data: ConfirmOtpRequest
): Promise<ApiResponse<ConfirmForgotPasswordOtpResponse>> => {
  const response = await api.post('/auth/confirm-otp', data)
  return response.data.data
}

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ApiResponse<ForgotPasswordResponse>> => {
  const response = await api.post('/auth/forgot-password', data)
  return response.data
}

export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse<unknown>> => {
  const response = await api.post('/auth/reset-password', data)
  return response.data
}

export const refreshToken = async (data?: { refreshToken: string }): Promise<ApiResponse<LoginResponse>> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false'
  }
  const response = await apiRaw.post('/auth/refresh', data, { headers })
  return response.data
}

export const logout = async (data?: { refreshToken: string }): Promise<ApiResponse<string>> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false'
  }
  const response = await api.post('/auth/logout', data, { headers })
  return response.data
}
