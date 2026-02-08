import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: 'タグ一覧 - お尻マニア',
    description: 'お尻作品のタグ・カテゴリ一覧',
};

async function getTags() {
    const tags = await prisma.tag.findMany({
        include: {
            _count: { select: { works: true } },
        },
        orderBy: { displayOrder: 'asc' },
    });
    return tags;
}

export default async function TagsPage() {
    const tags = await getTags();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
                        <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">タグ一覧</h1>
                        <p className="text-gray-400">カテゴリから作品を探す</p>
                    </div>
                </div>
            </div>

            {tags.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">タグがまだありません</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tags.map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="group rounded-xl bg-gray-800 border border-gray-700 p-6 hover:border-pink-500/50 hover:bg-gray-800/80 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors">
                                        {tag.name}
                                    </h3>
                                    {tag.description && (
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{tag.description}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2">
                                        {tag._count?.works || 0} 作品
                                    </p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
