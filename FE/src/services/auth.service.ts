import { api, apiRaw } from '@/src/lib/axios'
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ConfirmOtpRequest,
  ConfirmForgotPasswordOtpResponse,
  ConfirmOtpResult,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  CompanyRegisterRequest,
  GoogleLoginRequest,
  GoogleLoginResponse,
  SetupPasswordRequest,
  ForceChangePasswordRequest,
} from '@/src/types/auth'
import { ApiResponse } from '@/src/types/api'
import { checkCookiesEnabled } from '../utils'

export const loginWithGoogle = async (
  data: GoogleLoginRequest
): Promise<GoogleLoginResponse> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false',
  }
  const response = await api.post<ApiResponse<GoogleLoginResponse>>('/auth/google', data, { headers })
  return response.data.data
}

export const setupGooglePassword = async (
  data: SetupPasswordRequest
): Promise<LoginResponse> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false',
  }
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/setup-password', data, { headers })
  return response.data.data
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false',
  }
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data, { headers })
  return response.data.data
}

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', data)
  return response.data.data
}

export const registerCompany = async (
  data: CompanyRegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<ApiResponse<RegisterResponse>>('/companies/register', data)
  return response.data.data
}

export const confirmRegisterOtp = async (
  data: ConfirmOtpRequest
): Promise<ConfirmOtpResult> => {
  const response = await api.post<ApiResponse<ConfirmOtpResult>>('/auth/confirm-otp', data)
  return response.data.data
}

export const confirmForgotPasswordOtp = async (
  data: ConfirmOtpRequest
): Promise<ConfirmOtpResult<ConfirmForgotPasswordOtpResponse>> => {
  const response = await api.post<ApiResponse<ConfirmOtpResult<ConfirmForgotPasswordOtpResponse>>>('/auth/confirm-otp', data)
  return response.data.data
}

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', data)
  return response.data.data
}

export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await api.post<ApiResponse<void>>('/auth/reset-password', data)
}

export const refreshToken = async (data?: {
  refreshToken: string
}): Promise<LoginResponse> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false',
  }
  const response = await apiRaw.post<ApiResponse<LoginResponse>>('/auth/refresh', data, { headers })
  return response.data.data
}

export const logout = async (data?: { refreshToken: string }): Promise<string> => {
  const headers = {
    'X-Cookies-Enabled': checkCookiesEnabled() ? 'true' : 'false',
  }
  const response = await api.post<ApiResponse<string>>('/auth/logout', data, { headers })
  return response.data.data
}

export const forceChangePassword = async (data: ForceChangePasswordRequest): Promise<void> => {
  await api.put<ApiResponse<void>>('/auth/change-password', data)
}
