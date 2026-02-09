'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, Globe, GlobeLock } from 'lucide-react';

interface Article {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    thumbnailUrl: string | null;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState<number | null>(null);

    const fetchArticles = useCallback(async () => {
        try {
            const res = await fetch('/api/articles');
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleDelete = async (id: number) => {
        if (!confirm('この記事を削除しますか？')) return;

        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setArticles(articles.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    // 公開/非公開を切り替える関数
    const handleTogglePublish = async (article: Article) => {
        const newIsPublished = !article.isPublished;
        const action = newIsPublished ? '公開' : '非公開に';

        if (!confirm(`この記事を${action}しますか？`)) return;

        setPublishing(article.id);

        try {
            const res = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...article,
                    isPublished: newIsPublished,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setArticles(articles.map(a => a.id === article.id ? updated : a));
            }
        } catch (error) {
            console.error('Error updating article:', error);
        } finally {
            setPublishing(null);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ja-JP');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-pink-500" />
                    <h1 className="text-2xl font-bold text-white">記事管理</h1>
                </div>
                <Link
                    href="/admin/articles/new"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    新規作成
                </Link>
            </div>

            {/* Info */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-300">
                <p>💡 <strong>公開方法:</strong> 「公開する」ボタンをクリックすると、記事が公開サイトに表示されます。</p>
            </div>

            {/* Articles Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {articles.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>記事がありません</p>
                        <Link
                            href="/admin/articles/new"
                            className="inline-block mt-4 text-pink-400 hover:text-pink-300"
                        >
                            最初の記事を作成する
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">タイトル</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">ステータス</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">公開日</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-white">{article.title}</p>
                                            <p className="text-sm text-gray-400">/{article.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {article.isPublished ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                                                <Eye className="h-3 w-3" />
                                                公開中
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
                                                <EyeOff className="h-3 w-3" />
                                                下書き
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {formatDate(article.publishedAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {/* 公開/非公開ボタン */}
                                            <button
                                                onClick={() => handleTogglePublish(article)}
                                                disabled={publishing === article.id}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${article.isPublished
                                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                    } ${publishing === article.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={article.isPublished ? '非公開にする' : '公開する'}
                                            >
                                                {publishing === article.id ? (
                                                    <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                                                ) : article.isPublished ? (
                                                    <>
                                                        <GlobeLock className="h-3 w-3" />
                                                        非公開
                                                    </>
                                                ) : (
                                                    <>
                                                        <Globe className="h-3 w-3" />
                                                        公開する
                                                    </>
                                                )}
                                            </button>

                                            {/* 編集ボタン */}
                                            <Link
                                                href={`/admin/articles/${article.id}/edit`}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                                                title="編集"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>

                                            {/* 削除ボタン */}
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>

                                            {/* 表示ボタン（公開中のみ） */}
                                            {article.isPublished && (
                                                <Link
                                                    href={`/articles/${article.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-pink-400 hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="サイトで表示"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
