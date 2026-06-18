import { useMutation } from '@tanstack/react-query'
import {
  confirmRegisterOtp,
  confirmForgotPasswordOtp,
  forgotPassword,
  login,
  registerUser,
  registerCompany,
  resetPassword,
} from '@/src/services/auth.service'
import { useAuthStore } from '@/src/stores/auth.store'

export const useConfirmRegisterOtp = () => {
  return useMutation({
    mutationFn: confirmRegisterOtp,
  })
}

export const useConfirmForgotPasswordOtp = () => {
  return useMutation({
    mutationFn: confirmForgotPasswordOtp,
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  })
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuth({
        user: response.data.userResponse,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  })
}

export const useRegisterCompany = () => {
  return useMutation({
    mutationFn: registerCompany,
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  })
}
