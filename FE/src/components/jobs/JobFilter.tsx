'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface JobFilterProps {
    selectedTypes: string[];
    onTypeChange: (type: string) => void;
    salaryRange: number;
    onSalaryChange: (val: number) => void;
    selectedExp: string[];
    onExpChange: (exp: string) => void;
    selectedTechs: string[];
    onTechChange: (tech: string) => void;
    onClearAll: () => void;
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
    });

    const toggleSection = (
        section: keyof typeof openSections
    ) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const jobTypes = [
        'Full-time',
        'Part-time',
        'Contract',
        'Internship',
    ];

    const experienceLevels = [
        {
            id: 'Junior',
            label: 'Junior',
        },
        {
            id: 'Mid',
            label: 'Mid Level',
        },
        {
            id: 'Senior',
            label: 'Senior',
        },
        {
            id: 'Lead',
            label: 'Lead',
        },
        {
            id: 'Executive',
            label: 'Executive',
        },
    ];

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
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h2 className="font-bold text-slate-900 uppercase tracking-wider">
                    Filters
                </h2>

                <button
                    onClick={onClearAll}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                    Clear All
                </button>
            </div>

            {/* JOB TYPE */}
            <div className="mb-6 border-b pb-5">
                <button
                    onClick={() =>
                        toggleSection('jobType')
                    }
                    className="flex items-center justify-between w-full mb-3"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Job Type
                    </span>

                    {openSections.jobType ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {openSections.jobType && (
                    <div className="space-y-3">
                        {jobTypes.map((type) => (
                            <label
                                key={type}
                                className="flex items-center gap-3 text-sm cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(
                                        type
                                    )}
                                    onChange={() =>
                                        onTypeChange(type)
                                    }
                                    className="accent-blue-700"
                                />

                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* SALARY */}
            <div className="mb-6 border-b pb-5">
                <button
                    onClick={() =>
                        toggleSection('salary')
                    }
                    className="flex items-center justify-between w-full mb-3"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Salary Range
                    </span>

                    {openSections.salary ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {openSections.salary && (
                    <>
                        <input
                            type="range"
                            min={0}
                            max={10000}
                            step={500}
                            value={salaryRange}
                            onChange={(e) =>
                                onSalaryChange(
                                    Number(e.target.value)
                                )
                            }
                            className="w-full accent-amber-600"
                        />

                        <div className="flex justify-between mt-3 text-xs font-semibold">
                            <span>$0</span>

                            <span className="text-amber-700 font-bold">
                                Up to $
                                {salaryRange.toLocaleString()}
                            </span>

                            <span>$10,000+</span>
                        </div>
                    </>
                )}
            </div>

            {/* EXPERIENCE */}
            <div className="mb-6 border-b pb-5">
                <button
                    onClick={() =>
                        toggleSection('experience')
                    }
                    className="flex items-center justify-between w-full mb-3"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Experience Level
                    </span>

                    {openSections.experience ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {openSections.experience && (
                    <div className="space-y-3">
                        {experienceLevels.map((exp) => (
                            <label
                                key={exp.id}
                                className="flex items-center gap-3 text-sm cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedExp.includes(
                                        exp.id
                                    )}
                                    onChange={() =>
                                        onExpChange(exp.id)
                                    }
                                    className="accent-blue-700"
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
                    onClick={() =>
                        toggleSection('technology')
                    }
                    className="flex items-center justify-between w-full mb-3"
                >
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Technology
                    </span>

                    {openSections.technology ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {openSections.technology && (
                    <div className="flex flex-wrap gap-2">
                        {techOptions.map((tech) => {
                            const selected =
                                selectedTechs.includes(tech);

                            return (
                                <button
                                    key={tech}
                                    type="button"
                                    onClick={() =>
                                        onTechChange(tech)
                                    }
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selected
                                            ? 'bg-blue-700 text-white'
                                            : 'border border-slate-200 hover:border-slate-400'
                                        }`}
                                >
                                    {tech}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}