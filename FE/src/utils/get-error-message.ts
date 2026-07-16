import axios from 'axios'

export const isBlockedLoginError = (error: unknown): boolean => {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    error.response?.data?.message === 'User is blocked'
  )
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message
  }

  return 'Đã xảy ra lỗi'
}

export const isCvAlreadyExistsError = (error: unknown): boolean => {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 409 &&
    error.response?.data?.errorCode === 'CV_ALREADY_EXISTS'
  )
}

