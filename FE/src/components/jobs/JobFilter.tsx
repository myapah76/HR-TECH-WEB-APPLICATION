'use client'

import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import {
  JobType,
  ExperienceLevel,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '@/src/enums/job.enum'
import { useGetSkills } from '@/src/hooks/skill'

interface JobFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  salaryRange: [number, number]
  onSalaryChange: (val: [number, number]) => void
  selectedExp: string | null
  onExpChange: (exp: string | null) => void
  selectedTechs: string[]
  onTechChange: (tech: string) => void
  onClearAll: () => void
}

export default function JobFilter({
  selectedType,
  onTypeChange,
  salaryRange,
  onSalaryChange,
  selectedExp,
  onExpChange,
  selectedTechs,
  onTechChange,
  onClearAll,
}: JobFilterProps) {
  const [openSections, setOpenSections] = useState({
    jobType: true,
    salary: true,
    experience: true,
    technology: true,
  })

  const [techSearch, setTechSearch] = useState('')

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const formatSalaryLimit = (val: number) => {
    if (val === 100000000) return '100tr+'
    if (val === 0) return '0đ'
    return `${val / 1000000}tr`
  }

  const jobTypes = [
    { id: JobType.FULL_TIME, label: JOB_TYPE_LABELS[JobType.FULL_TIME] },
    { id: JobType.PART_TIME, label: JOB_TYPE_LABELS[JobType.PART_TIME] },
    { id: JobType.CONTRACT, label: JOB_TYPE_LABELS[JobType.CONTRACT] },
    { id: JobType.INTERNSHIP, label: JOB_TYPE_LABELS[JobType.INTERNSHIP] },
  ]

  const experienceLevels = [
    { id: ExperienceLevel.INTERN, label: EXPERIENCE_LEVEL_LABELS[ExperienceLevel.INTERN] },
    { id: ExperienceLevel.FRESHER, label: EXPERIENCE_LEVEL_LABELS[ExperienceLevel.FRESHER] },
    { id: ExperienceLevel.JUNIOR, label: `${EXPERIENCE_LEVEL_LABELS[ExperienceLevel.JUNIOR]} (Ít hơn 2 năm)` },
    { id: ExperienceLevel.MIDDLE, label: `${EXPERIENCE_LEVEL_LABELS[ExperienceLevel.MIDDLE]} (2 - 5 năm)` },
    { id: ExperienceLevel.SENIOR, label: `${EXPERIENCE_LEVEL_LABELS[ExperienceLevel.SENIOR]} (5+ năm)` },
  ]

  const { data: skillsData } = useGetSkills()

  const capitalizeSkill = (str: string) => {
    if (!str) return ''
    const specialCases: Record<string, string> = {
      react: 'React',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      html: 'HTML',
      css: 'CSS',
      springboot: 'Spring Boot',
      mysql: 'MySQL',
      restapi: 'REST API',
      nodejs: 'Node.js',
      mongodb: 'MongoDB',
      express: 'Express',
      flutter: 'Flutter',
      dart: 'Dart',
      firebase: 'Firebase',
      ios: 'iOS',
      android: 'Android',
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      aws: 'AWS',
      cicd: 'CI/CD',
      python: 'Python',
      sql: 'SQL',
      tableau: 'Tableau',
      excel: 'Excel',
      selenium: 'Selenium',
      cypress: 'Cypress',
      testing: 'Testing',
      automation: 'Automation',
      figma: 'Figma',
      sketch: 'Sketch',
      adobexd: 'Adobe XD',
      design: 'Design',
      linux: 'Linux',
      networking: 'Networking',
      bash: 'Bash',
      windowsserver: 'Windows Server',
      tensorflow: 'TensorFlow',
      pytorch: 'PyTorch',
      machinelearning: 'Machine Learning',
      swift: 'Swift',
      objectivec: 'Objective-C',
      xcode: 'Xcode',
      kotlin: 'Kotlin',
      golang: 'Golang',
      postgresql: 'PostgreSQL',
      redis: 'Redis',
      microservices: 'Microservices',
      vuejs: 'Vue.js',
      tailwind: 'Tailwind',
      azure: 'Azure',
      architecture: 'Architecture',
      systemdesign: 'System Design',
      scikitlearn: 'Scikit-Learn',
      keras: 'Keras',
      datascience: 'Data Science',
      oracle: 'Oracle',
      sqlserver: 'SQL Server',
      performancetuning: 'Performance Tuning',
      cybersecurity: 'Cybersecurity',
      penetrationtesting: 'Penetration Testing',
      owasp: 'OWASP',
      agile: 'Agile',
      scrum: 'Scrum',
      leadership: 'Leadership',
      productstrategy: 'Product Strategy',
      r: 'R',
      statistics: 'Statistics',
      datamining: 'Data Mining',
    }
    const key = str.toLowerCase()
    if (specialCases[key]) return specialCases[key]
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const techOptions = skillsData ? skillsData.map((skill) => capitalizeSkill(skill.name)) : []

  const filteredTechs = techSearch.trim()
    ? techOptions.filter((t) => t.toLowerCase().includes(techSearch.toLowerCase()))
    : techOptions

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="font-black text-slate-800 text-sm tracking-wider flex items-center gap-2 uppercase">
          <SlidersHorizontal className="w-4 h-4 text-slate-650" />
          <span>Bộ lọc tìm kiếm</span>
        </h2>
        <button
          onClick={onClearAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Xóa tất cả
        </button>
      </div>

      {/* JOB TYPE */}
      <div className="border-b border-slate-100 pb-5">
        <button
          onClick={() => toggleSection('jobType')}
          className="flex items-center justify-between w-full mb-4 text-left cursor-pointer"
        >
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            Hình thức làm việc
          </span>
          {openSections.jobType ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.jobType && (
          <div className="space-y-3 animate-fade-in">
            {jobTypes.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-3 text-sm font-bold text-slate-650 hover:text-slate-900 transition-colors cursor-pointer select-none"
              >
                <input
                  type="radio"
                  checked={selectedType === type.id}
                  onClick={() => onTypeChange(selectedType === type.id ? null : type.id)}
                  onChange={() => {}}
                  className="w-4.5 h-4.5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* SALARY */}
      <div className="border-b border-slate-100 pb-5">
        <button
          onClick={() => toggleSection('salary')}
          className="flex items-center justify-between w-full mb-4 text-left cursor-pointer"
        >
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            Mức lương mong muốn
          </span>
          {openSections.salary ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.salary && (
          <div className="space-y-4 animate-fade-in select-none">
            <div className="relative h-6 flex items-center">
              {/* Background Track */}
              <div className="absolute w-full h-1.5 bg-slate-100 rounded-lg" />
              {/* Highlighted active track */}
              <div
                className="absolute h-1.5 bg-blue-600 rounded-lg"
                style={{
                  left: `${(salaryRange[0] / 100000000) * 100}%`,
                  width: `${((salaryRange[1] - salaryRange[0]) / 100000000) * 100}%`,
                }}
              />
              {/* Min slider */}
              <input
                type="range"
                min={0}
                max={100000000}
                step={5000000}
                value={salaryRange[0]}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), salaryRange[1] - 5000000)
                  onSalaryChange([val, salaryRange[1]])
                }}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none outline-none
                           [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                           [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:bg-blue-650 [&::-webkit-slider-thumb]:cursor-pointer 
                           [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                           [&::-webkit-slider-thumb]:hover:scale-110
                           [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-none 
                           [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                           [&::-moz-range-thumb]:bg-blue-650 [&::-moz-range-thumb]:cursor-pointer 
                           [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all
                           [&::-moz-range-thumb]:hover:scale-110"
                style={{ zIndex: salaryRange[0] > 50000000 ? 5 : 4 }}
              />
              {/* Max slider */}
              <input
                type="range"
                min={0}
                max={100000000}
                step={5000000}
                value={salaryRange[1]}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), salaryRange[0] + 5000000)
                  onSalaryChange([salaryRange[0], val])
                }}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none outline-none
                           [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                           [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:bg-blue-650 [&::-webkit-slider-thumb]:cursor-pointer 
                           [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                           [&::-webkit-slider-thumb]:hover:scale-110
                           [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-none 
                           [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                           [&::-moz-range-thumb]:bg-blue-650 [&::-moz-range-thumb]:cursor-pointer 
                           [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all
                           [&::-moz-range-thumb]:hover:scale-110"
                style={{ zIndex: salaryRange[0] > 50000000 ? 4 : 5 }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>0đ</span>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-extrabold border border-blue-100">
                {formatSalaryLimit(salaryRange[0])} - {formatSalaryLimit(salaryRange[1])}
              </span>
              <span>100tr+</span>
            </div>
          </div>
        )}
      </div>

      {/* EXPERIENCE LEVEL */}
      <div className="border-b border-slate-100 pb-5">
        <button
          onClick={() => toggleSection('experience')}
          className="flex items-center justify-between w-full mb-4 text-left cursor-pointer"
        >
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            Cấp bậc / Kinh nghiệm
          </span>
          {openSections.experience ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.experience && (
          <div className="space-y-3 animate-fade-in">
            {experienceLevels.map((exp) => (
              <label
                key={exp.id}
                className="flex items-center gap-3 text-sm font-bold text-slate-650 hover:text-slate-900 transition-colors cursor-pointer select-none"
              >
                <input
                  type="radio"
                  checked={selectedExp === exp.id}
                  onClick={() => onExpChange(selectedExp === exp.id ? null : exp.id)}
                  onChange={() => {}}
                  className="w-4.5 h-4.5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                />
                <span>{exp.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* TECHNOLOGY */}
      <div>
        <button
          onClick={() => toggleSection('technology')}
          className="flex items-center justify-between w-full mb-4 text-left cursor-pointer"
        >
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">
            Công nghệ / Kỹ năng
          </span>
          <div className="flex items-center gap-2">
            {selectedTechs.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                {selectedTechs.length}
              </span>
            )}
            {openSections.technology ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {openSections.technology && (
          <div className="animate-fade-in space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm công nghệ..."
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Selected tags shown first */}
            {selectedTechs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
                {selectedTechs.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => onTechChange(tech)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1 transition-all hover:bg-blue-700"
                  >
                    {tech}
                    <span className="text-blue-200 text-[10px] font-black">×</span>
                  </button>
                ))}
              </div>
            )}

            {/* All tech tags */}
            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
              {filteredTechs.map((tech) => {
                const selected = selectedTechs.includes(tech)
                if (selected) return null // already shown above
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => onTechChange(tech)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer bg-slate-50 hover:bg-blue-50 text-slate-650 hover:text-blue-700 border border-slate-200/60 hover:border-blue-300"
                  >
                    {tech}
                  </button>
                )
              })}
              {filteredTechs.filter((t) => !selectedTechs.includes(t)).length === 0 && (
                <p className="text-xs text-slate-400 italic">Không tìm thấy công nghệ phù hợp</p>
              )}
            </div>
          </div>
        )}
      </div>
      </div>  {/* end scrollable */}
    </div>
  )
}