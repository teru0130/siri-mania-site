'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function NewVideoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        embedCode: '',
        description: '',
        thumbnailUrl: '',
        isPublished: true,
    });

    // プレビュー用の埋め込みコード（リアルタイムだと重い場合があるので、ボタン等で更新するか、debounceする手もあるが、今回はシンプルに）
    // const [previewCode, setPreviewCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title || !formData.embedCode) {
            setError('タイトルと埋め込みコードは必須です');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '動画の作成に失敗しました');
            }

            router.push('/admin/videos');
            router.refresh(); // 一覧を更新
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-white">動画を新規登録</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                タイトル <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                placeholder="動画のタイトル"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                埋め込みコード (HTML) <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.embedCode}
                                onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                                rows={8}
                                className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none font-mono text-sm"
                                placeholder='<iframe src="..." ...></iframe>'
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                YouTube、Pornhub、Xなどの埋め込みコード（iframeなど）をそのまま貼り付けてください。
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                説明文
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                placeholder="動画の説明（任意）"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                サムネイルURL
                            </label>
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    // DMM画像最適化: ps.jpg (small) -> pl.jpg (large)
                                    if (val.includes('dmm.co.jp') && val.endsWith('ps.jpg')) {
                                        val = val.replace('ps.jpg', 'pl.jpg');
                                    }
                                    setFormData({ ...formData, thumbnailUrl: val });
                                }}
                                className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                placeholder="https://example.com/thumbnail.jpg"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                一覧表示用のサムネイル画像があればURLを入力してください（任意）。
                                <br />
                                <span className="text-yellow-500">※ 高画質（1280x720以上推奨）の画像を使用してください。画質が低いとぼやけて表示されます。</span>
                                <br />
                                <span className="text-blue-400">※ DMMの画像URL（ps.jpg）は自動的に高画質版（pl.jpg）に変換されます。</span>
                            </p>
                            {formData.thumbnailUrl && (
                                <div className="mt-2 w-48 aspect-video rounded-lg overflow-hidden border border-gray-700 bg-black">
                                    <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                            <span className="text-sm font-medium text-gray-300">公開ステータス</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${formData.isPublished
                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {formData.isPublished ? (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        公開中
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="h-4 w-4" />
                                        下書き
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-600/50 text-white rounded-lg transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? '保存中...' : '保存する'}
                        </button>
                    </div>
                </form>

                {/* Preview */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">プレビュー</h2>
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="aspect-video bg-black flex items-center justify-center">
                            {formData.embedCode ? (
                                <div
                                    className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full"
                                    dangerouslySetInnerHTML={{ __html: formData.embedCode }}
                                />
                            ) : (
                                <div className="text-gray-600 text-sm">
                                    埋め込みコードを入力するとプレビューが表示されます
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white mb-2">
                                {formData.title || 'タイトル未入力'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {formData.description || '説明文なし'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
