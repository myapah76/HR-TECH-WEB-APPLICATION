import { useMutation } from '@tanstack/react-query'
import { acceptInterviewSchedule } from '@/src/services/application.service'

export const useAcceptInterviewSchedule = () => {
  return useMutation({
    mutationFn: acceptInterviewSchedule,
  })
}
