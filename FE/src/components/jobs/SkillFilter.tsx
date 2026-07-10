'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useGetSkills } from '@/src/hooks/skill'
import { capitalizeSkill } from '@/src/utils/skillUtils'

interface SkillFilterProps {
  selectedSkills: string[]
  onSkillsChange: (skills: string[]) => void
}

export default function SkillFilter({
  selectedSkills,
  onSkillsChange,
}: SkillFilterProps) {
  const [techSearch, setTechSearch] = useState('')
  const [showTechDropdown, setShowTechDropdown] = useState(false)
  const { data: skillsData } = useGetSkills()

  const toggleSkill = (tech: string) => {
    if (selectedSkills.includes(tech)) {
      onSkillsChange(selectedSkills.filter((s) => s !== tech))
    } else {
      onSkillsChange([...selectedSkills, tech])
    }
  }

  const techOptions = useMemo(() => {
    return skillsData ? skillsData.map((skill) => capitalizeSkill(skill.name)) : []
  }, [skillsData])

  const filteredTechs = useMemo(() => {
    if (!techSearch.trim()) return techOptions
    return techOptions.filter((t) => t.toLowerCase().includes(techSearch.toLowerCase()))
  }, [techSearch, techOptions])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
          Lọc theo công nghệ / kỹ năng:
        </span>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Selected skill badges */}
          {selectedSkills.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleSkill(tech)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 hover:bg-blue-700"
            >
              {tech}
              <span className="text-blue-200 text-[10px] font-black">×</span>
            </button>
          ))}

          {/* Autocomplete Combobox search trigger */}
          <div className="relative">
            <button
              onClick={() => setShowTechDropdown(!showTechDropdown)}
              className="px-4 py-1.5 rounded-full text-xs font-extrabold text-blue-650 hover:text-blue-850 border border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center gap-1"
            >
              + Thêm kỹ năng
            </button>

            {showTechDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setShowTechDropdown(false)
                    setTechSearch('')
                  }}
                />
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-fade-in animate-duration-150">
                  <div className="relative mb-2">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm kỹ năng..."
                      value={techSearch}
                      onChange={(e) => setTechSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredTechs
                      .filter((t) => !selectedSkills.includes(t))
                      .map((tech) => (
                        <button
                          key={tech}
                          onClick={() => {
                            toggleSkill(tech)
                            setShowTechDropdown(false)
                            setTechSearch('')
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          {tech}
                        </button>
                      ))}
                    {filteredTechs.filter((t) => !selectedSkills.includes(t)).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2 italic">
                        Không tìm thấy kỹ năng
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
