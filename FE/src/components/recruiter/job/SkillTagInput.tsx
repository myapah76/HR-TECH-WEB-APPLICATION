import React, { useState, useRef } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import { Skill } from '@/src/types/skill'
import { useSearchSkills } from '@/src/hooks/skill'
import { useClickOutside } from '@/src/hooks/useClickOutside'

interface SkillTagInputProps {
  value: Skill[]
  onChange: (skills: Skill[]) => void
  placeholder?: string
  colorTheme?: 'emerald' | 'blue'
}

export default function SkillTagInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm kỹ năng...',
  colorTheme = 'emerald',
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Use react-query to fetch suggestions based on inputValue
  const { data: suggestions = [], isFetching } = useSearchSkills(inputValue)

  useClickOutside(wrapperRef, () => setIsFocused(false))

  const handleAddSkill = (skill: Skill) => {
    if (!value.find((s) => s.id === skill.id)) {
      onChange([...value, skill])
    }
    setInputValue('')
    setIsFocused(false)
  }

  const handleRemoveSkill = (id: string) => {
    onChange(value.filter((s) => s.id !== id))
  }

  const tagBgClass =
    colorTheme === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
  const tagHoverClass = colorTheme === 'emerald' ? 'hover:bg-emerald-200' : 'hover:bg-blue-200'

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`min-h-12 border rounded-xl p-2 flex flex-wrap gap-2 items-center transition-colors bg-white ${
          isFocused ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
        }`}
        onClick={() => setIsFocused(true)}
      >
        {value.map((skill) => (
          <span
            key={skill.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${tagBgClass}`}
          >
            {skill.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveSkill(skill.id)
              }}
              className={`p-0.5 rounded-full transition-colors ${tagHoverClass}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        <div className="flex-1 min-w-30 flex items-center gap-2">
          {inputValue.length === 0 && <Search className="w-4 h-4 text-slate-400 shrink-0" />}
          <input
            type="text"
            className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400"
            placeholder={value.length === 0 ? placeholder : 'Thêm...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
        </div>
      </div>

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
