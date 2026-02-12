import Link from 'next/link';
import { ArrowLeft, Play, Film } from 'lucide-react';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import SampleVideoCard from '@/components/SampleVideoCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const latestVideo = await prisma.sampleVideo.findFirst({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
    });

    const title = 'サンプル動画一覧 - お尻マニア';
    const description = 'お尻・ヒップに特化した厳選AV作品のサンプル動画をご覧いただけます。';

    let ogImageUrl = latestVideo?.thumbnailUrl;

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

// サーバーサイドでデータ取得
async function getVideos() {
    try {
        // APIルートを使わずに直接DBから取得（サーバーコンポーネントなので）
        const videos = await prisma.sampleVideo.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
        });
        return videos;
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        return [];
    }
}

export default async function VideosPage() {
    const videos = await getVideos();

    // 構造化データの生成
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'ホーム',
                        'item': 'https://siri-mania-site.vercel.app'
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': 'サンプル動画一覧',
                        'item': 'https://siri-mania-site.vercel.app/videos'
                    }
                ]
            },
            {
                '@type': 'ItemList',
                'itemListElement': videos.map((video, index) => {
                    // DMM画像高画質化
                    let thumb = video.thumbnailUrl;
                    if (thumb && thumb.includes('dmm.co.jp')) {
                        try {
                            const urlObj = new URL(thumb);
                            urlObj.search = '';
                            thumb = urlObj.toString();
                            if (thumb.endsWith('ps.jpg')) thumb = thumb.replace('ps.jpg', 'pl.jpg');
                        } catch { }
                    }

                    // iframe src抽出
                    const srcMatch = video.embedCode.match(/src="([^"]+)"/);
                    const embedUrl = srcMatch ? srcMatch[1] : '';

                    return {
                        '@type': 'ListItem',
                        'position': index + 1,
                        'item': {
                            '@type': 'VideoObject',
                            'name': video.title,
                            'description': video.description || video.title,
                            'thumbnailUrl': thumb ? [thumb] : [],
                            'uploadDate': video.createdAt.toISOString(),
                            'embedUrl': embedUrl
                        }
                    };
                })
            }
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                        <Play className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">サンプル動画一覧</h1>
                        <p className="text-sm text-gray-400">厳選されたお尻動画をチェック</p>
                    </div>
                </div>
            </div>

            {/* Videos Grid */}
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <SampleVideoCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 mb-4">
                        <Film className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-lg text-gray-400">
                        現在公開されている動画はありません
                    </p>
                </div>
            )}
        </div>
    );
}
