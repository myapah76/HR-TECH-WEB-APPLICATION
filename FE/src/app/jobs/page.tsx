'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Search } from 'lucide-react'

import JobCard from '@/src/components/jobs/JobCard'
import JobFilter from '@/src/components/jobs/JobFilter'
import JobSearch from '@/src/components/jobs/JobSearch'
import Pagination from '@/src/components/common/Pagination'
import Loading from '@/src/app/loading'
import { useSearchJobs } from '@/src/hooks/job'
import { useGetSkills } from '@/src/hooks/skill'
import { capitalizeSkill } from '@/src/utils/skillUtils'

export default function JobListPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlKeyword = searchParams.get('keyword') ?? ''
  const urlLocation = searchParams.get('location') ?? ''
  const urlPage = Number(searchParams.get('page')) || 1
  const urlSize = Number(searchParams.get('size')) || 10

  const [keyword, setKeyword] = useState(urlKeyword)
  const [location, setLocation] = useState(urlLocation)

  // Đồng bộ lại ô input khi URL thay đổi (ví dụ: click tag từ khóa phổ biến hoặc nhấn back/forward)
  const [prevUrlKeyword, setPrevUrlKeyword] = useState(urlKeyword)
  const [prevUrlLocation, setPrevUrlLocation] = useState(urlLocation)

  if (urlKeyword !== prevUrlKeyword || urlLocation !== prevUrlLocation) {
    setPrevUrlKeyword(urlKeyword)
    setPrevUrlLocation(urlLocation)
    setKeyword(urlKeyword)
    setLocation(urlLocation)
  }

  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100000000])
  const [selectedExp, setSelectedExp] = useState<string | null>(null)
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])

  const [techSearch, setTechSearch] = useState('')
  const [showTechDropdown, setShowTechDropdown] = useState(false)
  const { data: skillsData } = useGetSkills()

  const toggleInSelectedTechs = (tech: string) => {
    setSelectedTechs((prev) => toggleInArray(prev, tech))
  }

  const techOptions = useMemo(() => {
    return skillsData ? skillsData.map((skill) => capitalizeSkill(skill.name)) : []
  }, [skillsData])

  const filteredTechs = useMemo(() => {
    if (!techSearch.trim()) return techOptions
    return techOptions.filter((t) => t.toLowerCase().includes(techSearch.toLowerCase()))
  }, [techSearch, techOptions])

  const [currentPage, setCurrentPage] = useState(urlPage)
  const [pageSize, setPageSize] = useState(urlSize)

  const [prevUrlPage, setPrevUrlPage] = useState(urlPage)
  const [prevUrlSize, setPrevUrlSize] = useState(urlSize)

  if (urlPage !== prevUrlPage || urlSize !== prevUrlSize) {
    setPrevUrlPage(urlPage)
    setPrevUrlSize(urlSize)
    setCurrentPage(urlPage)
    setPageSize(urlSize)
  }

  // Ref để lưu giá trị pageSize tạm thời khi thay đổi, tránh clashing do callback kép trong Pagination component
  const pendingPageSizeRef = useRef<number | null>(null)

  const updatePaginationUrl = (page: number, size: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    params.set('size', String(size))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const targetSize = pendingPageSizeRef.current !== null ? pendingPageSizeRef.current : pageSize
    pendingPageSizeRef.current = null
    updatePaginationUrl(page, targetSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    pendingPageSizeRef.current = size
    updatePaginationUrl(1, size)
  }

  // Reset về page 1 bất cứ khi nào filter hoặc URL thay đổi
  const [prevFilterHash, setPrevFilterHash] = useState(() =>
    JSON.stringify({
      keyword: urlKeyword,
      location: urlLocation,
      selectedType,
      salaryRange,
      selectedExp,
      selectedTechs,
    })
  )
  const currentFilterHash = JSON.stringify({
    keyword: urlKeyword,
    location: urlLocation,
    selectedType,
    salaryRange,
    selectedExp,
    selectedTechs,
  })
  if (currentFilterHash !== prevFilterHash) {
    setPrevFilterHash(currentFilterHash)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (urlPage !== 1) {
      updatePaginationUrl(1, pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterHash])

  const { data, isLoading } = useSearchJobs({
    page: currentPage - 1,
    size: pageSize,
    keyword: urlKeyword || undefined,
    location: urlLocation || undefined,
    jobType: selectedType || undefined,
    experienceLevel: selectedExp || undefined,
    salaryMin: salaryRange[0] > 0 ? salaryRange[0] : undefined,
    salaryMax: salaryRange[1] < 100000000 ? salaryRange[1] : undefined,
    skills: selectedTechs.length > 0 ? selectedTechs : undefined,
  })

  const totalPages = data?.totalPages ?? 0

  // Server-side filtered jobs directly from data
  const jobs = useMemo(() => {
    return data?.content ?? []
  }, [data?.content])

  const totalResults = useMemo(() => {
    return data?.totalElements ?? 0
  }, [data?.totalElements])

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  const handleClearAll = () => {
    setSelectedType(null)
    setSalaryRange([0, 100000000])
    setSelectedExp(null)
    setSelectedTechs([])
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <section className="relative bg-linear-to-r from-blue-900 via-indigo-950 to-slate-900 py-16 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Khám phá cơ hội việc làm IT hàng đầu
          </h1>
        </div>

        <JobSearch
          keyword={keyword}
          onKeywordChange={setKeyword}
          location={location}
          onLocationChange={setLocation}
          onSearch={handleSearch}
        />
      </section>

      <main className="max-w-350 mx-auto w-full px-4 py-8 flex-1">
        <div className="flex gap-12">
          <aside className="w-75 shrink-0">
            <JobFilter
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              salaryRange={salaryRange}
              onSalaryChange={setSalaryRange}
              selectedExp={selectedExp}
              onExpChange={setSelectedExp}
              onClearAll={handleClearAll}
            />
          </aside>

          <div className="flex-1">
            {/* Horizontal technology / skill filter container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
                  Lọc theo công nghệ / kỹ năng:
                </span>

                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {/* Selected skill badges */}
                  {selectedTechs.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => toggleInSelectedTechs(tech)}
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
                              .filter((t) => !selectedTechs.includes(t))
                              .map((tech) => (
                                <button
                                  key={tech}
                                  onClick={() => {
                                    toggleInSelectedTechs(tech)
                                    setShowTechDropdown(false)
                                    setTechSearch('')
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                                >
                                  {tech}
                                </button>
                              ))}
                            {filteredTechs.filter((t) => !selectedTechs.includes(t)).length ===
                              0 && (
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

            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-bold text-slate-800">
                Tìm thấy <span className="text-blue-600 font-extrabold">{totalResults}</span> việc
                làm phù hợp
              </p>

              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer">
                <span>Mới nhất</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <Loading />
              ) : jobs.length > 0 ? (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <div className="text-center py-10 text-gray-500">No jobs found</div>
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={data?.totalElements ?? 0}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handlePageSizeChange}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
