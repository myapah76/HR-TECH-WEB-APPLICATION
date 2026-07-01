import { useQuery } from '@tanstack/react-query'
import { getSkills, searchSkills } from '@/src/services/skill.service'

export const useGetSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => getSkills(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

export const useSearchSkills = (inputValue: string) => {
  return useQuery({
    queryKey: ['searchSkills', inputValue],
    queryFn: () => searchSkills(inputValue),
    enabled: inputValue.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
