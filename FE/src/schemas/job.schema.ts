import * as z from 'zod'

export const jobSchema = z
  .object({
    title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    position: z.string().min(1, 'Vui lòng nhập vị trí/vai trò tuyển dụng (VD: Java Developer)'),
    jobType: z.string().min(1, 'Vui lòng chọn hình thức làm việc'),
    experienceLevel: z.string().min(1, 'Vui lòng chọn cấp bậc'),
    location: z.string().min(3, 'Vui lòng nhập địa điểm'),
    salaryMin: z.number().min(0, 'Lương tối thiểu không hợp lệ').optional(),
    salaryMax: z.number().min(0, 'Lương tối đa không hợp lệ').optional(),
    deadline: z.string().min(1, 'Vui lòng chọn hạn nộp hồ sơ'),
    description: z.string().min(20, 'Mô tả công việc phải có ít nhất 20 ký tự'),
    requirements: z.string().min(20, 'Yêu cầu công việc phải có ít nhất 20 ký tự'),
    benefits: z.string().min(10, 'Quyền lợi phải có ít nhất 10 ký tự'),
  })
  .refine(
    (data) => {
      if (data.salaryMin && data.salaryMax) {
        return data.salaryMin <= data.salaryMax
      }
      return true
    },
    {
      message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
      path: ['salaryMax'],
    }
  )

export type JobFormData = z.infer<typeof jobSchema>
