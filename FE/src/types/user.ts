export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  phone: string
  address: string
  gender: number
  dateOfBirth: string
  isBlocked: boolean
  avatarUrl: string
  createdAt: string
  updatedAt: string
  roleResponse: RoleResponse
}

export interface RoleResponse {
  id: string
  name: string
  slug: string
  description: string
}

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
