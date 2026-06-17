'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import JobCard from '@/src/components/jobs/JobCard';
import JobFilter from '@/src/components/jobs/JobFilter';
import JobSearch from '@/src/components/jobs/JobSearch';
import Pagination from '@/src/components/jobs/Pagination';

import { getJobs } from '@/src/services/job.service';
import { Job } from '@/src/types/job';

export default function Home() {
    const [keyword, setKeyword] = useState('Senior Software Engineer');
    const [location, setLocation] = useState('');

    const [selectedTypes, setSelectedTypes] = useState<string[]>(['Remote']);
    const [salaryRange, setSalaryRange] = useState(0);
    const [selectedExp, setSelectedExp] = useState<string[]>(['Senior']);
    const [selectedTechs, setSelectedTechs] = useState<string[]>(['Golang']);

    const [currentPage, setCurrentPage] = useState(1);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const PAGE_SIZE = 10;
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);

                const res = await getJobs(currentPage - 1, PAGE_SIZE);

                setJobs(res.content);
                setTotalPages(res.totalPages);
                setTotalResults(res.totalElements);

                console.log('Jobs API:', res);
            } catch (error) {
                console.error('Load jobs failed:', error);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, [currentPage]);

    const toggleInArray = (arr: string[], value: string) =>
        arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value];

    const handleClearAll = () => {
        setSelectedTypes([]);
        setSalaryRange(0);
        setSelectedExp([]);
        setSelectedTechs([]);
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const favoriteIds = useMemo(() => new Set<string>(), []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading jobs...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200"></header>

            <section
                className="bg-[#3333FF] py-10 h-[200px]"
                style={{ backgroundColor: '#3333FF' }}
            >
                <JobSearch
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    location={location}
                    onLocationChange={setLocation}
                    onSearch={handleSearch}
                />
            </section>

            <main className="max-w-[1400px] mx-auto w-full px-4 py-8 flex-1">
                <div className="flex gap-12">
                    <aside className="w-[300px] shrink-0">
                        <JobFilter
                            selectedTypes={selectedTypes}
                            onTypeChange={(type) =>
                                setSelectedTypes((prev) =>
                                    toggleInArray(prev, type)
                                )
                            }
                            salaryRange={salaryRange}
                            onSalaryChange={setSalaryRange}
                            selectedExp={selectedExp}
                            onExpChange={(exp) =>
                                setSelectedExp((prev) =>
                                    toggleInArray(prev, exp)
                                )
                            }
                            selectedTechs={selectedTechs}
                            onTechChange={(tech) =>
                                setSelectedTechs((prev) =>
                                    toggleInArray(prev, tech)
                                )
                            }
                            onClearAll={handleClearAll}
                        />
                    </aside>

                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-5">
                            <p className="text-sm text-slate-600">
                                {totalResults} jobs found
                            </p>

                            <button className="flex items-center gap-1 text-sm">
                                Newest
                                <ChevronDown size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        isFavorite={favoriteIds.has(job.id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    No jobs found
                                </div>
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
    );

}