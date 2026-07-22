'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

import JobCard from '@/src/components/jobs/JobCard'
import JobFilter from '@/src/components/jobs/JobFilter'
import JobSearch from '@/src/components/jobs/JobSearch'
import SkillFilter from '@/src/components/jobs/SkillFilter'
import Pagination from '@/src/components/common/Pagination'
import Loading from '@/src/app/loading'
import { useSearchJobs } from '@/src/hooks/job'

const sortOptions = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'salaryMax,desc', label: 'Lương cao nhất' },
  { value: 'salaryMin,asc', label: 'Lương thấp nhất' },
]

export default function JobListPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlKeyword = searchParams.get('keyword') ?? ''
  const urlLocation = searchParams.get('location') ?? ''
  const urlPage = Number(searchParams.get('page')) || 1
  const urlSize = Number(searchParams.get('size')) || 10
  const urlSort = searchParams.get('sort') || 'createdAt,desc'
  const urlSkillsParam = searchParams.get('skills') ?? ''

  const urlSkills = useMemo(() => {
    return urlSkillsParam ? urlSkillsParam.split(',').filter(Boolean) : []
  }, [urlSkillsParam])

  const [keyword, setKeyword] = useState(urlKeyword)
  const [location, setLocation] = useState(urlLocation)
  const [selectedTechs, setSelectedTechs] = useState<string[]>(urlSkills)

  // Đồng bộ lại ô input khi URL thay đổi (ví dụ: click tag từ khóa phổ biến hoặc nhấn back/forward)
  const [prevUrlKeyword, setPrevUrlKeyword] = useState(urlKeyword)
  const [prevUrlLocation, setPrevUrlLocation] = useState(urlLocation)
  const [prevUrlSkillsParam, setPrevUrlSkillsParam] = useState(urlSkillsParam)

  if (
    urlKeyword !== prevUrlKeyword ||
    urlLocation !== prevUrlLocation ||
    urlSkillsParam !== prevUrlSkillsParam
  ) {
    setPrevUrlKeyword(urlKeyword)
    setPrevUrlLocation(urlLocation)
    setPrevUrlSkillsParam(urlSkillsParam)
    setKeyword(urlKeyword)
    setLocation(urlLocation)
    setSelectedTechs(urlSkills)
  }

  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100000000])
  const [selectedExp, setSelectedExp] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(urlPage)
  const [pageSize, setPageSize] = useState(urlSize)
  const [sortOrder, setSortOrder] = useState(urlSort)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const [prevUrlPage, setPrevUrlPage] = useState(urlPage)
  const [prevUrlSize, setPrevUrlSize] = useState(urlSize)
  const [prevUrlSort, setPrevUrlSort] = useState(urlSort)

  if (urlPage !== prevUrlPage || urlSize !== prevUrlSize || urlSort !== prevUrlSort) {
    setPrevUrlPage(urlPage)
    setPrevUrlSize(urlSize)
    setPrevUrlSort(urlSort)
    setCurrentPage(urlPage)
    setPageSize(urlSize)
    setSortOrder(urlSort)
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

  const handleSortChange = (newSort: string) => {
    setSortOrder(newSort)
    setShowSortDropdown(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    params.set('page', '1') // Reset page to 1 on sort change
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
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
    salaryMax: salaryRange[1] > 0 && salaryRange[1] < 100000000 ? salaryRange[1] : undefined,
    skills: selectedTechs.length > 0 ? selectedTechs : undefined,
    sort: sortOrder,
  })

  const totalPages = data?.page?.totalPages ?? 0

  // Server-side filtered jobs directly from data
  const jobs = useMemo(() => {
    return data?.content ?? []
  }, [data?.content])

  const totalResults = useMemo(() => {
    return data?.page?.totalElements ?? 0
  }, [data?.page?.totalElements])

  const handleClearAll = () => {
    setSelectedType(null)
    setSalaryRange([0, 100000000])
    setSelectedExp(null)
    setSelectedTechs([])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('skills')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSkillsChange = (techs: string[]) => {
    setSelectedTechs(techs)
    const params = new URLSearchParams(searchParams.toString())
    if (techs.length > 0) {
      params.set('skills', techs.join(','))
    } else {
      params.delete('skills')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <section
        className="relative overflow-hidden py-16 sm:py-20 text-white bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80')`,
        }}
      >
        {/* Dimming and gradient overlay for high contrast and readability */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/85 via-slate-900/80 to-slate-950/85 z-0" />

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Khám phá cơ hội việc làm IT hàng đầu
          </h1>
        </div>

        <div className="relative z-10">
          <JobSearch
            keyword={keyword}
            setKeyword={setKeyword}
            location={location}
            onLocationChange={setLocation}
            onSearch={handleSearch}
          />
        </div>
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
            <SkillFilter selectedSkills={selectedTechs} onSkillsChange={handleSkillsChange} />

            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-bold text-slate-800">
                Tìm thấy <span className="text-blue-600 font-extrabold">{totalResults}</span> việc
                làm phù hợp
              </p>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer select-none"
                >
                  <span>
                    {sortOptions.find((opt) => opt.value === sortOrder)?.label || 'Mới nhất'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-fade-in animate-duration-150">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            sortOrder === opt.value
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
              totalItems={totalResults}
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
