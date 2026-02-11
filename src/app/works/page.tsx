import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import prisma from '@/lib/prisma';
import WorkCard from '@/components/WorkCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;

export async function generateMetadata(): Promise<Metadata> {
    const latestWork = await prisma.work.findFirst({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
    });

    const title = '新着作品一覧 - お尻マニア';
    const description = '最近追加されたお尻・ヒップに特化したAV作品の一覧です。';

    let ogImageUrl = latestWork?.thumbnailUrl;

    // DMM画像高画質化 & パラメータ除去
    if (ogImageUrl && ogImageUrl.includes('dmm.co.jp')) {
        try {
            const urlObj = new URL(ogImageUrl);
            urlObj.search = '';
            ogImageUrl = urlObj.toString();
            if (ogImageUrl.endsWith('ps.jpg')) {
                ogImageUrl = ogImageUrl.replace('ps.jpg', 'pl.jpg');
            }
        } catch { }
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: ogImageUrl ? [ogImageUrl] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImageUrl ? [ogImageUrl] : [],
        },
    };
}

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function WorksPage({ searchParams }: PageProps) {
    const { page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || '1'));

    const [works, totalCount] = await Promise.all([
        prisma.work.findMany({
            where: { isPublished: true },
            include: {
                tags: { include: { tag: true } },
                metrics: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.work.count({ where: { isPublished: true } }),
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
                        <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">新着作品一覧</h1>
                        <p className="text-sm text-gray-400">全{totalCount}作品</p>
                    </div>
                </div>
            </div>

            {/* Works Grid */}
            {works.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {works.map((work) => (
                        <WorkCard key={work.id} work={work as never} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">作品がまだありません</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    {currentPage > 1 && (
                        <Link
                            href={`/works?page=${currentPage - 1}`}
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
                                    href={`/works?page=${p}`}
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
                            href={`/works?page=${currentPage + 1}`}
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
