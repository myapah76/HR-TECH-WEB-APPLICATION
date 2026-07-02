import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllFeatures,
} from '@/src/services/subscriptionPlan.service'
import { SubscriptionPlanRequest } from '@/src/types/subscription'

export const useGetAdminSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: getAllSubscriptionPlans,
  })
}

export const useGetFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: getAllFeatures,
  })
}

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SubscriptionPlanRequest) => createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] })
    },
  })
}

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionPlanRequest }) =>
      updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] })
    },
  })
}

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] })
    },
  })
}
