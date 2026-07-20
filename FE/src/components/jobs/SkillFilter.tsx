'use client'

import { useState, useMemo, useRef } from 'react'
import { Search, Loader2, Plus, X } from 'lucide-react'
import { useGetSkills, useSearchSkills } from '@/src/hooks/skill'
import { useClickOutside } from '@/src/hooks/useClickOutside'

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
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: allSkills = [] } = useGetSkills()
  const { data: searchedSkills = [], isFetching: isSearching } = useSearchSkills(techSearch)

  useClickOutside(dropdownRef, () => {
    setShowTechDropdown(false)
  })

  const handleAddSkill = (skillName: string) => {
    if (!selectedSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      onSkillsChange([...selectedSkills, skillName])
    }
    setTechSearch('')
    setShowTechDropdown(false)
  }

  const handleRemoveSkill = (techName: string) => {
    onSkillsChange(selectedSkills.filter((s) => s !== techName))
  }

  // Choose options from API live search when searching, or default list when empty
  const skillOptions = useMemo(() => {
    if (techSearch.trim().length > 0) {
      return searchedSkills.map((s) => ({ id: s.id, name: s.name }))
    }
    return allSkills.map((s) => ({ id: s.id, name: s.name }))
  }, [techSearch, searchedSkills, allSkills])

  // Filter out already selected skills
  const availableOptions = useMemo(() => {
    return skillOptions.filter(
      (opt) => !selectedSkills.some((sel) => sel.toLowerCase() === opt.name.toLowerCase())
    )
  }, [skillOptions, selectedSkills])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
          Lọc theo công nghệ / kỹ năng:
        </span>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Selected skill badges */}
          {selectedSkills.map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
            >
              {tech}
              <button
                type="button"
                onClick={() => handleRemoveSkill(tech)}
                className="hover:text-blue-200 text-white font-black text-xs cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Autocomplete Search Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowTechDropdown(!showTechDropdown)}
              className="px-4 py-1.5 rounded-full text-xs font-extrabold text-blue-650 hover:text-blue-850 border border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center gap-1"
            >
              <Plus size={13} /> Thêm kỹ năng
            </button>

            {showTechDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-fade-in animate-duration-150">
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm kỹ năng..."
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    autoFocus
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-3 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                      <span className="text-xs font-medium">Đang tìm kiếm...</span>
                    </div>
                  ) : availableOptions.length > 0 ? (
                    availableOptions.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleAddSkill(skill.name)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>{skill.name}</span>
                        <Plus size={12} className="text-slate-400" />
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-3 italic">
                      {techSearch.trim()
                        ? 'Không tìm thấy kỹ năng phù hợp'
                        : 'Đã chọn tất cả kỹ năng'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

