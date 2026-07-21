import React, { useState, useRef } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import { Skill } from '@/src/types/skill'
import { useSearchSkills } from '@/src/hooks/skill'
import { useClickOutside } from '@/src/hooks/useClickOutside'

export interface RequiredSkill extends Skill {
  level: string
}

interface RequiredSkillInputProps {
  value: RequiredSkill[]
  onChange: (skills: RequiredSkill[]) => void
  placeholder?: string
}

export default function RequiredSkillInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm kỹ năng bắt buộc...',
}: RequiredSkillInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: suggestions = [], isFetching } = useSearchSkills(inputValue)

  useClickOutside(wrapperRef, () => setIsFocused(false))

  const handleAddSkill = (skill: Skill) => {
    if (!value.find((s) => s.id === skill.id)) {
      // Default level is BEGINNER, user can change it
      onChange([...value, { ...skill, level: 'BEGINNER' }])
    }
    setInputValue('')
    setIsFocused(false)
  }

  const handleRemoveSkill = (id: string) => {
    onChange(value.filter((s) => s.id !== id))
  }

  const handleLevelChange = (id: string, newLevel: string) => {
    onChange(value.map((s) => (s.id === id ? { ...s, level: newLevel } : s)))
  }

  return (
    <div className="relative w-full space-y-3" ref={wrapperRef}>
      {/* List of selected skills with level dropdowns */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          {value.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{skill.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={skill.level}
                  onChange={(e) => handleLevelChange(skill.id, e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors bg-white ${
          isFocused ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
        }`}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </div>

      {/* Dropdown Suggestions */}
      {isFocused && inputValue.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {isFetching ? (
            <div className="flex items-center justify-center p-4 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Đang tìm kiếm...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((skill) => (
                <li
                  key={skill.id}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                  onClick={() => handleAddSkill(skill)}
                >
                  <span className="font-medium text-slate-900">{skill.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              Không tìm thấy kỹ năng phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
