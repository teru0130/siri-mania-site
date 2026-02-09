'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnailUrl: '',
        isPublished: false,
    });

    const fetchArticle = useCallback(async () => {
        try {
            const res = await fetch(`/api/articles/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    title: data.title || '',
                    slug: data.slug || '',
                    excerpt: data.excerpt || '',
                    content: data.content || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    isPublished: data.isPublished || false,
                });
            } else {
                setError('記事が見つかりません');
            }
        } catch (err) {
            setError('記事の読み込みに失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update article');
            }

            router.push('/admin/articles');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/articles"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">記事を編集</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            タイトル <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                            placeholder="記事のタイトル"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            スラッグ（URL） <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center">
                            <span className="px-3 py-3 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg text-gray-400 text-sm">
                                /articles/
                            </span>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                required
                                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-r-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                placeholder="article-slug"
                            />
                        </div>
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            サムネイルURL
                        </label>
                        <input
                            type="url"
                            value={formData.thumbnailUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            抜粋
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
                            placeholder="記事の概要（一覧ページに表示されます）"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            本文 <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            required
                            rows={15}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none font-mono text-sm"
                            placeholder="記事の本文（Markdownが使えます）"
                        />
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublished ? 'bg-pink-600' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className="flex items-center gap-2 text-gray-300">
                            {formData.isPublished ? (
                                <>
                                    <Eye className="h-4 w-4 text-green-400" />
                                    公開する
                                </>
                            ) : (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    下書きとして保存
                                </>
                            )}
                        </span>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                        <Save className="h-5 w-5" />
                        {saving ? '保存中...' : '保存'}
                    </button>
                    <Link
                        href="/admin/articles"
                        className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                        キャンセル
                    </Link>
                </div>
            </form>
        </div>
    );
}
