import { useQuery } from '@tanstack/react-query'
import { getMyCompanyMember, getCompanyMembers } from '@/src/services/company.service'
import { useAuthStore } from '@/src/stores/auth.store'

export const useGetMyCompanyMember = (companyId?: string) => {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['myCompanyMember', companyId, user?.id],
    queryFn: async () => {
      try {
        return await getMyCompanyMember(companyId!)
      } catch {
        const members = await getCompanyMembers(companyId!)
        return members.find((m) => m.userId === user?.id) ?? null
      }
    },
    enabled: !!companyId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}
