'use client'

import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw } from 'lucide-react'
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship']

  const experienceLevels = [
    { id: 'Junior', label: 'Junior (Ít hơn 2 năm)' },
    { id: 'Mid', label: 'Mid Level (2 - 5 năm)' },
    { id: 'Senior', label: 'Senior (5+ năm)' },
    { id: 'Lead', label: 'Lead / Tech Lead' },
    { id: 'Executive', label: 'Executive / Giám đốc' },
  ]

  const techOptions = [
    'React',
    'Node',
    'TypeScript',
    'AWS',
    'Docker',
    'Kubernetes',
    'PostgreSQL',
    'Go',
    'Python',
  ]

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
                key={type}
                className="flex items-center gap-3 text-sm font-bold text-slate-650 hover:text-slate-900 transition-colors cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => onTypeChange(type)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                />
                <span>{type}</span>
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
          {openSections.technology ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.technology && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {techOptions.map((tech) => {
              const selected = selectedTechs.includes(tech)
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => onTechChange(tech)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-205 cursor-pointer ${
                    selected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-850 border border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  {tech}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}