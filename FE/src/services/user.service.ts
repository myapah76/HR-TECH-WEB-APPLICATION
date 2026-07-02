import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import {
  User,
  UpdateUserRequest,
  ChangePasswordRequest,
  UpdateUserBlockedRequest,
  AdminUsersParams,
} from '@/src/types/user'

export const getUsers = async (params: AdminUsersParams): Promise<PageResponse<User>> => {
  const response = await api.get<ApiResponse<PageResponse<User>>>('/users/admin', { params })
  return response.data.data
}

export const updateUserProfile = async (data: UpdateUserRequest): Promise<User> => {
  const response = await api.put<ApiResponse<User>>('/users/me', data)
  return response.data.data
}

export const changeUserPassword = async (data: ChangePasswordRequest): Promise<User> => {
  const response = await api.put<ApiResponse<User>>('/users/me/password', data)
  return response.data.data
}

export const updateUserBlockedStatus = async ({
  userId,
  isBlocked,
}: UpdateUserBlockedRequest): Promise<User> => {
  const response = await api.patch<ApiResponse<User>>(`/users/${userId}/block-status`, {
    isBlocked,
  })

  return response.data.data
}
