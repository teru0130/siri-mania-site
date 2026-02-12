import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import SampleVideoCard from '@/components/SampleVideoCard';
import Pagination from '@/components/ui/Pagination';
import SortSelect from '@/components/ui/SortSelect';
import { ItemList, WithContext } from 'schema-dts';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 12;

export async function generateMetadata(): Promise<Metadata> {
    const latestVideo = await prisma.sampleVideo.findFirst({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
    });

    const title = 'サンプル動画 - お尻マニア';
    const description = 'お尻・ヒップに特化したAV動画のサンプル一覧です。';

    let ogImageUrl = latestVideo?.thumbnailUrl;
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

export default async function VideosPage({ searchParams }: PageProps) {
    const { page, sort } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || '1'));
    const currentSort = sort || 'newest';

    const orderBy: any = currentSort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' };

    const [videos, totalCount] = await Promise.all([
        prisma.sampleVideo.findMany({
            where: { isPublished: true },
            orderBy,
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.sampleVideo.count({ where: { isPublished: true } }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const sortOptions = [
        { value: 'newest', label: '新しい順' },
        { value: 'oldest', label: '古い順' },
    ];

    // 構造化データ
    const jsonLd: WithContext<ItemList> = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: videos.map((video, index) => ({
            '@type': 'VideoObject',
            position: index + 1,
            name: video.title,
            description: video.description || video.title,
            thumbnailUrl: [video.thumbnailUrl || ''],
            uploadDate: video.createdAt.toISOString(),
            embedUrl: video.embedCode.match(/src="([^"]+)"/)?.[1] || '',
        })),
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <PlayCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">サンプル動画</h1>
                            <p className="text-sm text-gray-400">厳選されたヒップ動作のサンプル動画 (全{totalCount}件)</p>
                        </div>
                    </div>
                </div>

                <SortSelect options={sortOptions} />
            </div>

            {/* Videos Grid */}
            {videos.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">動画がまだありません</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                        <SampleVideoCard key={video.id} video={video as never} />
                    ))}
                </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    );
}
