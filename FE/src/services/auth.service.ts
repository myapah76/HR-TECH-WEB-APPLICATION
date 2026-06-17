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
} from '@/src/types/auth'
import { ApiResponse } from '@/src/types/api'

export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await api.post('/auth/login', data)
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

export const refreshToken = async (): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiRaw.post('/auth/refresh')
  return response.data
}

export const logout = async (): Promise<ApiResponse<string>> => {
  const response = await api.post('/auth/logout')
  return response.data
}
