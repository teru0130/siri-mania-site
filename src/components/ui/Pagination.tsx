'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `${baseUrl || pathname}?${params.toString()}`;
    };

    // 表示するページ番号のロジック (現在ページ前後2件 + 最初 + 最後)
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages
    );

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            {currentPage > 1 && (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gray-700 transition-all"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
            )}

            <div className="flex items-center gap-1">
                {pages.map((p, i, arr) => {
                    const showDots = i > 0 && arr[i - 1] !== p - 1;
                    return (
                        <div key={p} className="flex items-center">
                            {showDots && (
                                <span className="px-2 text-gray-500">...</span>
                            )}
                            <Link
                                href={createPageUrl(p)}
                                className={`
                                    flex items-center justify-center w-10 h-10 rounded-lg border font-medium transition-all
                                    ${p === currentPage
                                        ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gray-700'
                                    }
                                `}
                            >
                                {p}
                            </Link>
                        </div>
                    );
                })}
            </div>

            {currentPage < totalPages && (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gray-700 transition-all"
                >
                    <ChevronRight className="h-5 w-5" />
                </Link>
            )}
        </div>
    );
}
