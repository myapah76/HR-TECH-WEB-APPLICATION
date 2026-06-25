'use client'

import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'

interface JobFilterProps {
  selectedTypes: string[]
  onTypeChange: (type: string) => void
  salaryRange: number
  onSalaryChange: (val: number) => void
  selectedExp: string[]
  onExpChange: (exp: string) => void
  selectedTechs: string[]
  onTechChange: (tech: string) => void
  onClearAll: () => void
}

export default function JobFilter({
  selectedTypes,
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

  const jobTypes = [
    { id: 'FULL_TIME', label: 'Full-time' },
    { id: 'PART_TIME', label: 'Part-time' },
    { id: 'CONTRACT', label: 'Contract' },
    { id: 'INTERNSHIP', label: 'Internship' },
  ]

  const experienceLevels = [
    { id: 'INTERN', label: 'Intern' },
    { id: 'FRESHER', label: 'Fresher' },
    { id: 'JUNIOR', label: 'Junior (Ít hơn 2 năm)' },
    { id: 'MIDDLE', label: 'Middle (2 - 5 năm)' },
    { id: 'SENIOR', label: 'Senior (5+ năm)' },
  ]

  const techOptions = [
    'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js',
    'Node.js', 'Express', 'NestJS', 'Spring Boot', 'Django', 'FastAPI', 'Laravel',
    'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C#', 'C++', 'PHP', 'Ruby',
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'GraphQL', 'REST API', 'gRPC', 'Kafka', 'RabbitMQ',
    'Git', 'Linux', 'Nginx', 'Microservices',
  ]

  const filteredTechs = techSearch.trim()
    ? techOptions.filter((t) => t.toLowerCase().includes(techSearch.toLowerCase()))
    : techOptions

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-24 space-y-6">
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
                  type="checkbox"
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => onTypeChange(type.id)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
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
            Mức lương tối đa
          </span>
          {openSections.salary ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.salary && (
          <div className="space-y-4 animate-fade-in">
            <input
              type="range"
              min={0}
              max={10000}
              step={500}
              value={salaryRange}
              onChange={(e) => onSalaryChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-650"
            />
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>$0</span>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-extrabold border border-blue-100">
                Lên tới ${salaryRange.toLocaleString()}
              </span>
              <span>$10,000+</span>
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
                  type="checkbox"
                  checked={selectedExp.includes(exp.id)}
                  onChange={() => onExpChange(exp.id)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
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
    </div>
  )
}