'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
    value: string;
    label: string;
}

interface SortSelectProps {
    options: SortOption[];
    defaultValue?: string;
}

export default function SortSelect({ options, defaultValue = 'newest' }: SortSelectProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || defaultValue;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        params.set('page', '1'); // ソート変更時は1ページ目に戻す
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <div className="relative">
                <select
                    value={currentSort}
                    onChange={handleChange}
                    className="appearance-none bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-750 transition-colors"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
