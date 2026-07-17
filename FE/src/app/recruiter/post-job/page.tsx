'use client'

import { useCreateJobMutation } from '@/src/hooks/job'
import { useGetMyCompany } from '@/src/hooks/company'
import Loading from '@/src/app/loading'
import { dateInputToInstant } from '@/src/utils'
import { JobFormData } from '@/src/schemas/job.schema'
import { RequiredSkill } from '@/src/components/company/job/RequiredSkillInput'
import { Skill } from '@/src/types/skill'
import JobForm from '@/src/components/company/job/JobForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PostJobPage() {
  const router = useRouter()
  const createJobMutation = useCreateJobMutation()
  const { data: myCompany, isLoading: isCompanyLoading } = useGetMyCompany()

  const onSubmit = (
    data: JobFormData,
    requiredSkills: RequiredSkill[],
    relatedSkills: Skill[]
  ) => {
    if (!myCompany?.id) {
      toast.error('Không tìm thấy thông tin công ty của bạn!')
      return
    }

    const companyId = myCompany.id
    const skills = [
      ...requiredSkills.map((s) => ({ skillNeo4jId: s.id, requiredLevel: s.level })),
      ...relatedSkills.map((s) => ({ skillNeo4jId: s.id })),
    ]

    const payload = {
      ...data,
      companyId,
      skills,
      deadline: dateInputToInstant(data.deadline),
    }

    createJobMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Đăng tin tuyển dụng thành công!')
        router.push('/recruiter/manage-jobs')
      },
    })
  }

  if (isCompanyLoading) {
    return <Loading />
  }

  return (
    <JobForm
      title="Tạo tin tuyển dụng mới"
      subtitle="Điền các thông tin dưới đây để đăng tin tuyển dụng tìm kiếm ứng viên tài năng."
      submitLabel="Đăng tin tuyển dụng"
      isPending={createJobMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/recruiter/manage-jobs')}
    />
  )
}
