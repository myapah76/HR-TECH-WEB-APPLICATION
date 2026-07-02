import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/src/services/user.service'
import { AdminUsersParams } from '@/src/types/user'

export const useGetUsers = (params: AdminUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  })
}
