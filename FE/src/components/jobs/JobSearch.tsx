'use client';

import { Search, MapPin } from 'lucide-react';

interface JobSearchProps {
    keyword: string;
    onKeywordChange: (val: string) => void;
    location: string;
    onLocationChange: (val: string) => void;
    onSearch: () => void;
}

export default function JobSearch({
    keyword,
    onKeywordChange,
    location,
    onLocationChange,
    onSearch,
}: JobSearchProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="
        w-full
        max-w-5xl
        mx-auto
        bg-white
        rounded-2xl
        border
        border-slate-200
        shadow-xl
        flex
        flex-col
        md:flex-row
        overflow-hidden
      "
        >
            {/* Keyword */}
            <div className="flex-1 flex items-center px-5 py-4">
                <Search className="w-5 h-5 text-slate-400 mr-3" />

                <input
                    type="text"
                    value={keyword}
                    onChange={(e) =>
                        onKeywordChange(e.target.value)
                    }
                    placeholder="Job title, keyword, company..."
                    className="
            w-full
            outline-none
            bg-transparent
            text-slate-800
            font-medium
          "
                />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-slate-200" />

            {/* Location */}
            <div className="md:w-72 flex items-center px-5 py-4">
                <MapPin className="w-5 h-5 text-slate-400 mr-3" />

                <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                        onLocationChange(e.target.value)
                    }
                    placeholder="Location"
                    className="
            w-full
            outline-none
            bg-transparent
            text-slate-800
            font-medium
          "
                />
            </div>

            {/* Button */}
            <button
                type="submit"
                className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          font-bold
          px-10
          py-4
          transition-all
          duration-200
        "
            >
                Search
            </button>
        </form>
    );
}