import { useAuthStore } from '@/src/stores/auth.store'
import { useMyCurrentSubscriptionQuery } from './useMyCurrentSubscriptionQuery'

/**
 * useSubscriptionAccess – kiểm tra người dùng hiện tại có gói PAID hay không.
 * - Free users (Gói Cơ Bản, price = 0): hasPaidPlan = false → tính năng premium bị khóa
 * - Paid users (price > 0): hasPaidPlan = true → truy cập đầy đủ
 */
export function useSubscriptionAccess() {
  const { user } = useAuthStore()
  const { data: subRes, isLoading } = useMyCurrentSubscriptionQuery(!!user)

  const subscription = subRes?.data ?? null
  const isActive = !!subscription && subscription.status === 'ACTIVE'
  // Chỉ tính là "có gói trả phí" khi price > 0 (phân biệt Free vs Paid)
  const hasPaidPlan = isActive && (subscription.planPrice ?? 0) > 0

  return {
    isLoading,
    hasPaidPlan,
    /** @deprecated dùng hasPaidPlan thay thế */
    hasPlan: hasPaidPlan,
    subscription,
    planName: subscription?.planName ?? null,
    planPrice: subscription?.planPrice ?? 0,
  }
}
