import { useQuery } from '@tanstack/react-query'
import { searchSkills } from '@/src/services/skill.service'

export const useSearchSkills = (inputValue: string) => {
  return useQuery({
    queryKey: ['searchSkills', inputValue],
    queryFn: () => searchSkills(inputValue),
    enabled: inputValue.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
