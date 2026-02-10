import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import prisma from '@/lib/prisma';
import WorkCard from '@/components/WorkCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '高評価作品一覧 - お尻マニア',
    description: '高スコアのお尻・ヒップに特化したAV作品を総合スコア順に紹介します。',
};

const ITEMS_PER_PAGE = 20;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
    const { page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || '1'));

    const [works, totalCount] = await Promise.all([
        prisma.work.findMany({
            where: {
                isPublished: true,
                metrics: { overallPickScore: { gt: 0 } },
            },
            include: {
                tags: { include: { tag: true } },
                metrics: true,
            },
            orderBy: { metrics: { overallPickScore: 'desc' } },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.work.count({
            where: {
                isPublished: true,
                metrics: { overallPickScore: { gt: 0 } },
            },
        }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    トップに戻る
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                        <Star className="h-5 w-5 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">高評価作品一覧</h1>
                        <p className="text-sm text-gray-400">総合スコア順 · 全{totalCount}作品</p>
                    </div>
                </div>
            </div>

            {/* Works Grid */}
            {works.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {works.map((work, index) => (
                        <WorkCard
                            key={work.id}
                            work={work as never}
                            showRank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">スコアが設定された作品がまだありません</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    {currentPage > 1 && (
                        <Link
                            href={`/compare?page=${currentPage - 1}`}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-pink-500/50 transition-colors"
                        >
                            前へ
                        </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                        .map((p, i, arr) => {
                            const elements = [];
                            if (i > 0 && arr[i - 1] !== p - 1) {
                                elements.push(
                                    <span key={`dots-${p}`} className="px-2 text-gray-500">...</span>
                                );
                            }
                            elements.push(
                                <Link
                                    key={p}
                                    href={`/compare?page=${p}`}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${p === currentPage
                                            ? 'bg-pink-600 border-pink-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-pink-500/50'
                                        }`}
                                >
                                    {p}
                                </Link>
                            );
                            return elements;
                        })}
                    {currentPage < totalPages && (
                        <Link
                            href={`/compare?page=${currentPage + 1}`}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-pink-500/50 transition-colors"
                        >
                            次へ
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
