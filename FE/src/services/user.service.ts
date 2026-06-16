import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { User } from '@/src/types/user'

export interface UpdateUserRequest {
  firstName: string
  lastName?: string
  email: string
  username?: string
  phone?: string
  address?: string
  gender: number
  dateOfBirth: string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  id: string
  oldPassword?: string
  newPassword?: string
}

export const updateUserProfile = async (data: UpdateUserRequest): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>('/users/me', data)
  return response.data
}

export const changeUserPassword = async (data: ChangePasswordRequest): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>('/users/me/password', data)
  return response.data
}
