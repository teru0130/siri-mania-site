import Link from 'next/link';
import Image from 'next/image';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '記事一覧 - お尻マニア',
    description: 'お尻マニアの記事一覧',
};

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
    const articles = await prisma.article.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
    });

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-8 w-8 text-pink-500" />
                    <h1 className="text-3xl font-bold text-white">記事</h1>
                </div>
                <p className="text-gray-400">お尻・ヒップに関する情報やおすすめ作品の紹介記事</p>
            </div>

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">まだ記事がありません</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            className="group block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gray-900">
                                {article.thumbnailUrl ? (
                                    <Image
                                        src={article.thumbnailUrl}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText className="h-12 w-12 text-gray-700" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
                                    {article.title}
                                </h2>
                                {article.excerpt && (
                                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(article.publishedAt)}
                                    </span>
                                    <span className="flex items-center gap-1 text-pink-400 group-hover:gap-2 transition-all">
                                        続きを読む
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
