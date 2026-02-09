import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
        where: { slug },
    });

    if (!article || !article.isPublished) {
        return { title: '記事が見つかりません - お尻マニア' };
    }

    return {
        title: `${article.title} - お尻マニア`,
        description: article.excerpt || article.title,
    };
}

export default async function ArticleDetailPage({ params }: PageProps) {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
        where: { slug },
    });

    if (!article || !article.isPublished) {
        notFound();
    }

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Simple markdown-like rendering (basic)
    const renderContent = (content: string) => {
        return content
            .split('\n\n')
            .map((paragraph, index) => {
                // Headings
                if (paragraph.startsWith('### ')) {
                    return (
                        <h3 key={index} className="text-xl font-bold text-white mt-8 mb-4">
                            {paragraph.slice(4)}
                        </h3>
                    );
                }
                if (paragraph.startsWith('## ')) {
                    return (
                        <h2 key={index} className="text-2xl font-bold text-white mt-10 mb-4">
                            {paragraph.slice(3)}
                        </h2>
                    );
                }
                if (paragraph.startsWith('# ')) {
                    return (
                        <h1 key={index} className="text-3xl font-bold text-white mt-10 mb-4">
                            {paragraph.slice(2)}
                        </h1>
                    );
                }
                // Lists
                if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                    return (
                        <ul key={index} className="list-disc list-inside space-y-2 text-gray-300 my-4">
                            {items.map((item, i) => (
                                <li key={i}>{item.slice(2)}</li>
                            ))}
                        </ul>
                    );
                }
                // Regular paragraph
                return (
                    <p key={index} className="text-gray-300 leading-relaxed my-4">
                        {paragraph}
                    </p>
                );
            });
    };

    // Get related articles
    const relatedArticles = await prisma.article.findMany({
        where: {
            isPublished: true,
            id: { not: article.id },
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back link */}
            <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                記事一覧に戻る
            </Link>

            <article className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(article.publishedAt)}
                        </span>
                    </div>
                </header>

                {/* Thumbnail */}
                {article.thumbnailUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
                        <Image
                            src={article.thumbnailUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                    {renderContent(article.content)}
                </div>
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-pink-400" />
                        関連記事
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {relatedArticles.map((related) => (
                            <Link
                                key={related.id}
                                href={`/articles/${related.slug}`}
                                className="group block bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-pink-500/50 transition-colors"
                            >
                                <h3 className="font-medium text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                                    {related.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    {formatDate(related.publishedAt)}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
