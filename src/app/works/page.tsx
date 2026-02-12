import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import prisma from '@/lib/prisma';
import WorkCard from '@/components/WorkCard';
import Pagination from '@/components/ui/Pagination';
import SortSelect from '@/components/ui/SortSelect';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;

export async function generateMetadata(): Promise<Metadata> {
    const latestWork = await prisma.work.findFirst({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
    });

    const title = '作品一覧 - お尻マニア';
    const description = 'お尻・ヒップに特化した厳選AV作品の一覧です。スコア順や新着順で探せます。';

    let ogImageUrl = latestWork?.thumbnailUrl;
    if (ogImageUrl && ogImageUrl.includes('dmm.co.jp')) {
        try {
            const urlObj = new URL(ogImageUrl);
            urlObj.search = '';
            ogImageUrl = urlObj.toString();
            if (ogImageUrl.endsWith('ps.jpg')) ogImageUrl = ogImageUrl.replace('ps.jpg', 'pl.jpg');
        } catch { }
    }

    return {
        title,
        description,
        openGraph: { title, description, images: ogImageUrl ? [ogImageUrl] : [] },
        twitter: { card: 'summary_large_image', title, description, images: ogImageUrl ? [ogImageUrl] : [] },
    };
}

interface PageProps {
    searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function WorksPage({ searchParams }: PageProps) {
    const { page, sort } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || '1'));
    const currentSort = sort || 'newest';

    // ソート条件の生成
    let orderBy: any = { createdAt: 'desc' };
    if (currentSort === 'oldest') orderBy = { createdAt: 'asc' };
    if (currentSort === 'score') orderBy = { metrics: { overallPickScore: 'desc' } };
    if (currentSort === 'release') orderBy = { releaseDate: 'desc' };

    const [works, totalCount] = await Promise.all([
        prisma.work.findMany({
            where: { isPublished: true },
            include: {
                tags: { include: { tag: true } },
                metrics: true,
            },
            orderBy,
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.work.count({ where: { isPublished: true } }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const sortOptions = [
        { value: 'newest', label: '新着順' },
        { value: 'release', label: '発売日順' },
        { value: 'score', label: 'スコア高い順' },
        { value: 'oldest', label: '古い順' },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
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
                            <h1 className="text-2xl font-bold text-white">作品一覧</h1>
                            <p className="text-sm text-gray-400">全{totalCount}作品</p>
                        </div>
                    </div>
                </div>

                <SortSelect options={sortOptions} />
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
            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    );
}
