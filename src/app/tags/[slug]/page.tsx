import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Tag, ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';
import WorkCard from '@/components/WorkCard';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const tag = await prisma.tag.findUnique({ where: { slug } });

    if (!tag) {
        return { title: 'タグが見つかりません - 尻マニア' };
    }

    return {
        title: `${tag.name} - タグ - 尻マニア`,
        description: tag.description || `${tag.name}タグの作品一覧`,
    };
}

async function getTagWithWorks(slug: string) {
    const tag = await prisma.tag.findUnique({
        where: { slug },
        include: {
            works: {
                where: { work: { isPublished: true } },
                include: {
                    work: {
                        include: {
                            tags: { include: { tag: true } },
                            metrics: true,
                        },
                    },
                },
                orderBy: { work: { createdAt: 'desc' } },
            },
        },
    });
    return tag;
}

export default async function TagDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const tag = await getTagWithWorks(slug);

    if (!tag) {
        notFound();
    }

    const works = tag.works.map((wt) => wt.work);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Link */}
            <Link
                href="/tags"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                タグ一覧に戻る
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
                        <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{tag.name}</h1>
                        {tag.description && (
                            <p className="text-gray-400">{tag.description}</p>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-500">{works.length} 作品</p>
            </div>

            {/* Works Grid */}
            {works.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">このタグには作品がありません</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {works.map((work) => (
                        <WorkCard key={work.id} work={work as never} />
                    ))}
                </div>
            )}
        </div>
    );
}
