'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, ImagePlus, Bold, Heading2, Heading3, List } from 'lucide-react';

export default function NewArticlePage() {
    const router = useRouter();
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnailUrl: '',
        isPublished: false,
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title),
        }));
    };

    // テキスト挿入ヘルパー
    const insertText = (before: string, after: string = '') => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end);
        const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end);

        setFormData(prev => ({ ...prev, content: newText }));

        // カーソル位置を調整
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + before.length + selectedText.length + after.length;
        }, 0);
    };

    // 画像挿入
    const handleInsertImage = () => {
        if (!imageUrl) return;

        const markdown = `![${imageAlt || '画像'}](${imageUrl})`;
        insertText(markdown + '\n\n');

        setShowImageModal(false);
        setImageUrl('');
        setImageAlt('');
    };

    // Markdown ツールバーボタン
    const toolbarButtons = [
        { icon: Bold, label: '太字', action: () => insertText('**', '**') },
        { icon: Heading2, label: '見出し2', action: () => insertText('## ') },
        { icon: Heading3, label: '見出し3', action: () => insertText('### ') },
        { icon: List, label: 'リスト', action: () => insertText('- ') },
        { icon: ImagePlus, label: '画像挿入', action: () => setShowImageModal(true) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create article');
            }

            router.push('/admin/articles');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

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
                <h1 className="text-2xl font-bold text-white">新規記事作成</h1>
            </div>

            {/* Image Insert Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-white mb-4">画像を挿入</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    画像URL <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                    placeholder="https://example.com/image.jpg"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    代替テキスト（alt）
                                </label>
                                <input
                                    type="text"
                                    value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                    placeholder="画像の説明"
                                />
                            </div>
                            {imageUrl && (
                                <div className="p-3 bg-gray-900 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-2">プレビュー:</p>
                                    <img
                                        src={imageUrl}
                                        alt={imageAlt || '画像'}
                                        className="max-h-40 rounded object-contain mx-auto"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleInsertImage}
                                disabled={!imageUrl}
                                className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                挿入
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageModal(false);
                                    setImageUrl('');
                                    setImageAlt('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            onChange={handleTitleChange}
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

                    {/* Content with Toolbar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            本文 <span className="text-red-400">*</span>
                        </label>

                        {/* Toolbar */}
                        <div className="flex items-center gap-1 p-2 bg-gray-900 border border-b-0 border-gray-700 rounded-t-lg">
                            {toolbarButtons.map((btn, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={btn.action}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                    title={btn.label}
                                >
                                    <btn.icon className="h-4 w-4" />
                                </button>
                            ))}
                            <span className="ml-auto text-xs text-gray-500">Markdownが使えます</span>
                        </div>

                        <textarea
                            ref={contentRef}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            required
                            rows={15}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-b-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none font-mono text-sm"
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
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? '保存中...' : '保存'}
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
