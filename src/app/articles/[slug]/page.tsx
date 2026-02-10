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
    // URLエンコードされたスラッグをデコード
    const decodedSlug = decodeURIComponent(slug);

    const article = await prisma.article.findUnique({
        where: { slug: decodedSlug },
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
    // URLエンコードされたスラッグをデコード
    const decodedSlug = decodeURIComponent(slug);

    const article = await prisma.article.findUnique({
        where: { slug: decodedSlug },
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

    // HTML埋め込みを含む段落かどうかを判定
    const isHtmlContent = (text: string) => {
        return /<[a-zA-Z][^>]*>/.test(text);
    };

    // Simple markdown-like rendering (basic) + HTML embed support
    const renderContent = (content: string) => {
        // テキスト内のインライン要素をレンダリング
        const renderInline = (text: string, baseKey: string) => {
            const elements: React.ReactNode[] = [];
            let remaining = text;
            let keyIndex = 0;

            // 画像: ![alt](url)
            const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
            let lastIndex = 0;
            let match;

            while ((match = imageRegex.exec(text)) !== null) {
                // 画像の前のテキスト
                if (match.index > lastIndex) {
                    const beforeText = text.substring(lastIndex, match.index);
                    elements.push(...renderBoldText(beforeText, `${baseKey}-${keyIndex++}`));
                }
                // 画像
                elements.push(
                    <img
                        key={`${baseKey}-img-${keyIndex++}`}
                        src={match[2]}
                        alt={match[1] || '画像'}
                        className="max-w-full h-auto rounded-lg my-4 mx-auto block"
                    />
                );
                lastIndex = match.index + match[0].length;
            }

            // 残りのテキスト
            if (lastIndex < text.length) {
                elements.push(...renderBoldText(text.substring(lastIndex), `${baseKey}-${keyIndex++}`));
            }

            return elements.length > 0 ? elements : renderBoldText(text, baseKey);
        };

        // 太字: **text**
        const renderBoldText = (text: string, baseKey: string): React.ReactNode[] => {
            const parts = text.split(/(\*\*[^*]+\*\*)/g);
            return parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={`${baseKey}-bold-${i}`} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                }
                return <span key={`${baseKey}-text-${i}`}>{part}</span>;
            });
        };

        return content
            .split('\n\n')
            .map((paragraph, index) => {
                const trimmed = paragraph.trim();

                // HTMLタグを含む段落（アフィリエイトコード等）はそのままHTMLとしてレンダリング
                if (isHtmlContent(trimmed)) {
                    return (
                        <div
                            key={index}
                            className="my-6 affiliate-embed text-center"
                            dangerouslySetInnerHTML={{ __html: trimmed }}
                        />
                    );
                }

                // 画像のみの段落
                if (/^!\[([^\]]*)\]\(([^)]+)\)$/.test(trimmed)) {
                    const match = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
                    if (match) {
                        return (
                            <div key={index} className="my-6">
                                <img
                                    src={match[2]}
                                    alt={match[1] || '画像'}
                                    className="max-w-full h-auto rounded-lg mx-auto block"
                                />
                            </div>
                        );
                    }
                }
                // Headings
                if (trimmed.startsWith('### ')) {
                    return (
                        <h3 key={index} className="text-xl font-bold text-white mt-8 mb-4">
                            {renderInline(trimmed.slice(4), `h3-${index}`)}
                        </h3>
                    );
                }
                if (trimmed.startsWith('## ')) {
                    return (
                        <h2 key={index} className="text-2xl font-bold text-white mt-10 mb-4">
                            {renderInline(trimmed.slice(3), `h2-${index}`)}
                        </h2>
                    );
                }
                if (trimmed.startsWith('# ')) {
                    return (
                        <h1 key={index} className="text-3xl font-bold text-white mt-10 mb-4">
                            {renderInline(trimmed.slice(2), `h1-${index}`)}
                        </h1>
                    );
                }
                // Lists
                if (trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n').filter(line => line.startsWith('- '));
                    return (
                        <ul key={index} className="list-disc list-inside space-y-2 text-gray-300 my-4">
                            {items.map((item, i) => (
                                <li key={i}>{renderInline(item.slice(2), `li-${index}-${i}`)}</li>
                            ))}
                        </ul>
                    );
                }
                // Regular paragraph
                return (
                    <p key={index} className="text-gray-300 leading-relaxed my-4">
                        {renderInline(trimmed, `p-${index}`)}
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
