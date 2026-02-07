import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Building2, ExternalLink, ArrowLeft, Tag } from 'lucide-react';
import prisma from '@/lib/prisma';
import ScoreCard from '@/components/ScoreCard';
import WorkCard from '@/components/WorkCard';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const work = await prisma.work.findUnique({
        where: { id: parseInt(id), isPublished: true },
    });

    if (!work) {
        return { title: '作品が見つかりません - 尻マニア' };
    }

    return {
        title: `${work.title} - 尻マニア`,
        description: work.description || `${work.title}のスコア詳細・比較情報`,
    };
}

async function getWorkDetail(id: string) {
    const workId = parseInt(id);
    if (isNaN(workId)) return null;

    const work = await prisma.work.findUnique({
        where: { id: workId, isPublished: true },
        include: {
            category: true,
            tags: { include: { tag: true } },
            metrics: true,
        },
    });

    if (!work) return null;

    // 関連作品
    const tagIds = work.tags.map((t) => t.tagId);
    const relatedWorks = await prisma.work.findMany({
        where: {
            id: { not: work.id },
            isPublished: true,
            tags: { some: { tagId: { in: tagIds } } },
        },
        include: {
            tags: { include: { tag: true } },
            metrics: true,
        },
        take: 6,
    });

    return { work, relatedWorks };
}

export default async function WorkDetailPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getWorkDetail(id);

    if (!data) {
        notFound();
    }

    const { work, relatedWorks } = data;
    const actresses = (work.actresses as string[]) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Link */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                トップに戻る
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Image & Basic Info */}
                <div className="lg:col-span-1">
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 mb-6">
                        {work.thumbnailUrl ? (
                            <Image
                                src={work.thumbnailUrl}
                                alt={work.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <span className="text-6xl">🍑</span>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <a
                        href={work.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4 text-lg font-bold text-white hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/25"
                    >
                        <span>公式サイトで詳細を見る</span>
                        <ExternalLink className="h-5 w-5" />
                    </a>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{work.title}</h1>

                        {/* Tags */}
                        {work.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {work.tags.map((wt) => (
                                    <Link
                                        key={wt.tagId}
                                        href={`/tags/${wt.tag.slug}`}
                                        className="flex items-center gap-1 rounded-full bg-gray-800 border border-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-400 transition-all"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {wt.tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {work.releaseDate && (
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(work.releaseDate).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                            {work.durationMinutes && (
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {work.durationMinutes}分
                                </span>
                            )}
                            {work.makerName && (
                                <span className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {work.makerName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actresses */}
                    {actresses.length > 0 && (
                        <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                出演者
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {actresses.map((name, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-full bg-gray-700 text-sm text-white">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {work.description && (
                        <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">作品概要</h3>
                            <p className="text-gray-300 leading-relaxed">{work.description}</p>
                        </div>
                    )}

                    {/* Score Card */}
                    {work.metrics && <ScoreCard metrics={work.metrics} />}
                </div>
            </div>

            {/* Related Works */}
            {relatedWorks.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-6">関連作品</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {relatedWorks.map((work) => (
                            <WorkCard key={work.id} work={work as never} size="small" />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
