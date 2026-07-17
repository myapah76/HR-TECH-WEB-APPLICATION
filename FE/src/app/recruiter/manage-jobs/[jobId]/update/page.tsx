'use client'

import { useParams, useRouter } from 'next/navigation'
import Loading from '@/src/app/loading'
import { useGetJobById, useUpdateJobMutation } from '@/src/hooks/job'
import { Job } from '@/src/types/job'
import { Skill } from '@/src/types/skill'
import { JobFormData } from '@/src/schemas/job.schema'
import { RequiredSkill } from '@/src/components/company/job/RequiredSkillInput'
import JobForm from '@/src/components/company/job/JobForm'
import { dateInputToInstant } from '@/src/utils'
import { toast } from 'sonner'

export default function UpdateJobPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { data: job, isLoading, isError } = useGetJobById(jobId)

  if (isLoading) return <Loading />

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-semibold text-red-600">
        Không thể tải thông tin tin tuyển dụng. Vui lòng thử lại sau.
      </div>
    )
  }

  return <UpdateJobForm job={job} />
}

function UpdateJobForm({ job }: { job: Job }) {
  const router = useRouter()
  const updateJobMutation = useUpdateJobMutation(job.id)

  const onSubmit = (
    data: JobFormData,
    requiredSkills: RequiredSkill[],
    relatedSkills: Skill[]
  ) => {
    const updatePayload = {
      ...data,
      companyId: job.companyId,
      deadline: dateInputToInstant(data.deadline),
      skills: [
        ...requiredSkills.map((skill: RequiredSkill) => ({
          skillNeo4jId: skill.id,
          requiredLevel: skill.level,
        })),
        ...relatedSkills.map((skill: Skill) => ({ skillNeo4jId: skill.id })),
      ],
    }

    updateJobMutation.mutate(updatePayload, {
      onSuccess: () => {
        toast.success('Cập nhật tin tuyển dụng thành công!')
        router.push('/recruiter/manage-jobs')
      },
    })
  }

  return (
    <JobForm
      job={job}
      title="Chỉnh sửa tin tuyển dụng"
      subtitle="Chỉnh sửa các thông tin dưới đây cho tin tuyển dụng của bạn."
      submitLabel="Cập nhật tin tuyển dụng"
      isPending={updateJobMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/recruiter/manage-jobs')}
    />
  )
}
