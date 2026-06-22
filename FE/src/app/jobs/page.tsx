'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import JobCard from '@/src/components/jobs/JobCard'
import JobFilter from '@/src/components/jobs/JobFilter'
import JobSearch from '@/src/components/jobs/JobSearch'
import Pagination from '@/src/components/jobs/Pagination'
import Loading from '@/src/app/loading'
import { useGetJobs } from '@/src/hooks/job'

export default function Home() {
  const [keyword, setKeyword] = useState('Senior Software Engineer')
  const [location, setLocation] = useState('')

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Remote'])
  const [salaryRange, setSalaryRange] = useState(0)
  const [selectedExp, setSelectedExp] = useState<string[]>(['Senior'])
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['Golang'])

  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 10

  const { data, isLoading } = useGetJobs(currentPage - 1, PAGE_SIZE)
  const jobs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalResults = data?.totalElements ?? 0

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  const handleClearAll = () => {
    setSelectedTypes([])
    setSalaryRange(0)
    setSelectedExp([])
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
              selectedTypes={selectedTypes}
              onTypeChange={(type) => setSelectedTypes((prev) => toggleInArray(prev, type))}
              salaryRange={salaryRange}
              onSalaryChange={setSalaryRange}
              selectedExp={selectedExp}
              onExpChange={(exp) => setSelectedExp((prev) => toggleInArray(prev, exp))}
              selectedTechs={selectedTechs}
              onTechChange={(tech) => setSelectedTechs((prev) => toggleInArray(prev, tech))}
              onClearAll={handleClearAll}
            />
          </aside>

          <div className="flex-1">
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
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
