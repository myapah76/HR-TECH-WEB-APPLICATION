import { useRouter } from 'next/navigation'
import { useGetTrendingSkills } from '@/src/hooks/skill'
import { getSkillIconConfig } from '@/src/utils/skillUtils'

export default function TrendingSkills() {
  const router = useRouter()
  const { data, isLoading } = useGetTrendingSkills(8)
  const skills = data || []

  const handleSkillClick = (skillName: string) => {
    router.push(`/jobs?skills=${encodeURIComponent(skillName)}`)
  }

  return (
    <section
      className="bg-slate-50/30 dark:bg-slate-900/10 py-12 border-t border-b border-slate-100 dark:border-slate-800/60 transition-colors"
      id="trending-skills-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center mb-8" id="trending-skills-header">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {'KỸ NĂNG & CÔNG NGHỆ XU HƯỚNG'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
            {'KHÁM PHÁ CÁC VIỆC LÀM THEO CÔNG NGHỆ BẠN THÀNH THẠO'}
          </p>
        </div>

        {/* 4-column balanced flex/grid row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="skills-cards-grid">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-slate-50 border border-slate-200/70 dark:bg-slate-850/20 dark:border-slate-800/70 p-5 rounded-2xl flex flex-col items-center justify-center text-center h-36"
              >
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4 mt-3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2 mt-2" />
              </div>
            ))
          ) : skills.length > 0 ? (
            skills.map((skill, index) => {
              const { icon: IconComponent, colorClass } = getSkillIconConfig(skill.name)
              return (
                <div
                  key={index}
                  onClick={() => handleSkillClick(skill.name)}
                  className="group bg-white dark:bg-slate-850/40 border border-gray-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  id={`skill-card-${index}`}
                >
                  {/* Circular Icon layout */}
                  <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 flex items-center justify-center border border-gray-100 dark:border-slate-700/60 group-hover:border-blue-100 dark:group-hover:border-blue-900/40 transition-colors shadow-inner">
                    <IconComponent className={`h-5 w-5 ${colorClass}`} />
                  </div>

                  {/* Title and stats */}
                  <h3 className="text-xs font-black text-gray-900 dark:text-slate-205 mt-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-tight">
                    {skill.name}
                  </h3>
                  <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full mt-2">
                    {skill.jobCount.toLocaleString()} {'việc làm'}
                  </p>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-6 text-center text-sm font-semibold text-slate-400">
              Chưa có kỹ năng xu hướng nào được cập nhật
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
