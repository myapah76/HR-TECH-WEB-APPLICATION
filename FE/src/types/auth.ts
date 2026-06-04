import { User } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  userResponse: User
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

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  message: string
}
