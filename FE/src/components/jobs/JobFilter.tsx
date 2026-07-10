'use client'

import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import {
  JobType,
  ExperienceLevel,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '@/src/enums/job.enum'

interface JobFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  salaryRange: [number, number]
  onSalaryChange: (val: [number, number]) => void
  selectedExp: string | null
  onExpChange: (exp: string | null) => void
  onClearAll: () => void
}

export default function JobFilter({
  selectedType,
  onTypeChange,
  salaryRange,
  onSalaryChange,
  selectedExp,
  onExpChange,
  onClearAll,
}: JobFilterProps) {
  const [openSections, setOpenSections] = useState({
    jobType: true,
    salary: true,
    experience: true,
  })

  const [prevSalaryRange, setPrevSalaryRange] = useState(salaryRange)
  const [tempSalary, setTempSalary] = useState<[number, number]>(salaryRange)

  if (salaryRange[0] !== prevSalaryRange[0] || salaryRange[1] !== prevSalaryRange[1]) {
    setPrevSalaryRange(salaryRange)
    setTempSalary(salaryRange)
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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
    {
      id: ExperienceLevel.JUNIOR,
      label: `${EXPERIENCE_LEVEL_LABELS[ExperienceLevel.JUNIOR]} (Ít hơn 2 năm)`,
    },
    {
      id: ExperienceLevel.MIDDLE,
      label: `${EXPERIENCE_LEVEL_LABELS[ExperienceLevel.MIDDLE]} (2 - 5 năm)`,
    },
    {
      id: ExperienceLevel.SENIOR,
      label: `${EXPERIENCE_LEVEL_LABELS[ExperienceLevel.SENIOR]} (5+ năm)`,
    },
  ]

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
            <div className="space-y-3.5 animate-fade-in select-none">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Tối thiểu (Tr. VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tempSalary[0] === 0 ? '' : tempSalary[0] / 1000000}
                    onChange={(e) => {
                      const typed = e.target.value
                      const val = typed === '' ? 0 : Number(typed) * 1000000
                      setTempSalary([val, tempSalary[1]])
                    }}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 transition-all placeholder:font-medium text-slate-700"
                    placeholder="Từ 0 tr"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Tối đa (Tr. VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tempSalary[1] === 100000000 ? '' : tempSalary[1] / 1000000}
                    onChange={(e) => {
                      const typed = e.target.value
                      const val = typed === '' ? 100000000 : Number(typed) * 1000000
                      setTempSalary([tempSalary[0], val])
                    }}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 transition-all placeholder:font-medium text-slate-700"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <button
                onClick={() => onSalaryChange(tempSalary)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-xs cursor-pointer text-center"
              >
                Áp dụng mức lương
              </button>
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
      </div>{' '}
      {/* end scrollable */}
    </div>
  )
}
