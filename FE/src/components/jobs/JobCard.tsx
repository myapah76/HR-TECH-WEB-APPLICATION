'use client';

import { MapPin, Briefcase, Heart, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Job } from '@/src/types/job';

interface JobCardProps {
    job: Job;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
}

/** Generates a deterministic gradient from a company name */
function getAvatarGradient(name: string): string {
    const gradients = [
        'from-blue-500 to-indigo-600',
        'from-violet-500 to-purple-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-600',
        'from-teal-500 to-cyan-600',
        'from-emerald-500 to-green-600',
        'from-sky-500 to-blue-600',
        'from-fuchsia-500 to-violet-600',
    ];
    const index = (name?.charCodeAt(0) ?? 0) % gradients.length;
    return gradients[index];
}

interface CompanyLogoProps {
    url?: string | null;
    name: string;
}

function CompanyLogo({ url, name }: CompanyLogoProps) {
    const [imgError, setImgError] = useState(false);
    const initial = name?.charAt(0)?.toUpperCase() ?? '?';
    const gradient = getAvatarGradient(name);

    const showFallback = !url || imgError;

    return (
        <div className="relative shrink-0 w-14 h-14">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm" />

            {/* Logo surface */}
            <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-white flex items-center justify-center shadow-inner">
                {showFallback ? (
                    <div
                        className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                    >
                        <span className="text-white font-black text-xl tracking-tight select-none drop-shadow">
                            {initial}
                        </span>
                    </div>
                ) : (
                    <img
                        src={url!}
                        alt={name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain p-1.5"
                    />
                )}
            </div>
        </div>
    );
}

export default function JobCard({
    job,
    isFavorite = false,
    onToggleFavorite,
}: JobCardProps) {
    const [favorite, setFavorite] = useState(isFavorite);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorite(!favorite);
        onToggleFavorite?.(job.id);
    };

    const salaryText =
        job.salaryMin && job.salaryMax
            ? `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`
            : 'Negotiable';

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-blue-500/80 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 group">
            <div className="flex gap-4 sm:gap-5 flex-1 min-w-0 items-start">
                {/* Company Logo */}
                <CompanyLogo url={job.companyLogoUrl} name={job.companyName} />

                <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[#0d47a1] group-hover:text-blue-800 transition-colors text-lg sm:text-xl tracking-tight leading-snug mb-2">
                        {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500 mb-4">
                        <span className="flex items-center gap-1 text-slate-800">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                            <span>{job.companyName}</span>
                        </span>

                        <span className="flex items-center gap-1 text-[#c8860d]">
                            <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                            <span>{salaryText}</span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{job.location}</span>
                        </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5">
                        {job.skills?.map((skill, index) => (
                            <span
                                key={index}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors"
                            >
                                {skill.skillName}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto shrink-0 self-stretch mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-none">
                <div className="flex items-center gap-2">
                    {job.status === 'OPEN' && (
                        <span className="text-[9px] font-black tracking-wider bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-md uppercase leading-none">
                            OPEN
                        </span>
                    )}

                    <button
                        onClick={handleFavoriteClick}
                        className="p-1.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                        <Heart
                            className={`h-4 w-4 transition-all ${favorite ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
                        />
                    </button>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 tracking-wide mt-2 sm:mt-auto">
                    {new Date(job.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}