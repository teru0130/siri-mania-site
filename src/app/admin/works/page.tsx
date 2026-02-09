'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Star } from 'lucide-react';
import Link from 'next/link';

interface TagData {
    id: number;
    name: string;
    slug: string;
}

interface MetricsData {
    hipFocusScore: number;
    cameraFocusScore: number;
    outfitEmphasisScore: number;
    danceFitnessScore: number;
    overallPickScore: number;
}

interface WorkData {
    id: number;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    affiliateUrl: string | null;
    isPublished: boolean;
    releaseDate: string | null;
    tags: { tagId: number; tag: TagData }[];
    metrics: MetricsData | null;
    createdAt: string;
    updatedAt: string;
}

export default function AdminWorksPage() {
    const [works, setWorks] = useState<WorkData[]>([]);
    const [tags, setTags] = useState<TagData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWork, setEditingWork] = useState<WorkData | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnailUrl: '',
        affiliateUrl: '',
        tagIds: [] as number[],
        isPublished: true,
        releaseDate: '',
        // スコア
        hipFocusScore: 5,
        cameraFocusScore: 5,
        outfitEmphasisScore: 5,
        danceFitnessScore: 5,
        overallPickScore: 5,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchWorks = useCallback(async () => {
        try {
            const res = await fetch('/api/works?all=true&limit=100');
            const data = await res.json();
            setWorks(data.works || []);
        } catch (err) {
            console.error('Failed to fetch works:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTags = useCallback(async () => {
        try {
            const res = await fetch('/api/tags');
            const data = await res.json();
            setTags(data.tags || []);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        }
    }, []);

    useEffect(() => {
        fetchWorks();
        fetchTags();
    }, [fetchWorks, fetchTags]);

    const handleOpenModal = (work?: WorkData) => {
        if (work) {
            setEditingWork(work);
            setFormData({
                title: work.title,
                description: work.description || '',
                thumbnailUrl: work.thumbnailUrl || '',
                affiliateUrl: work.affiliateUrl || '',
                tagIds: work.tags.map(t => t.tagId),
                isPublished: work.isPublished,
                releaseDate: work.releaseDate ? work.releaseDate.split('T')[0] : '',
                hipFocusScore: work.metrics?.hipFocusScore ?? 5,
                cameraFocusScore: work.metrics?.cameraFocusScore ?? 5,
                outfitEmphasisScore: work.metrics?.outfitEmphasisScore ?? 5,
                danceFitnessScore: work.metrics?.danceFitnessScore ?? 5,
                overallPickScore: work.metrics?.overallPickScore ?? 5,
            });
        } else {
            setEditingWork(null);
            setFormData({
                title: '',
                description: '',
                thumbnailUrl: '',
                affiliateUrl: '',
                tagIds: [],
                isPublished: true,
                releaseDate: '',
                hipFocusScore: 5,
                cameraFocusScore: 5,
                outfitEmphasisScore: 5,
                danceFitnessScore: 5,
                overallPickScore: 5,
            });
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingWork(null);
        setError('');
    };

    const handleTagToggle = (tagId: number) => {
        setFormData(prev => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter(id => id !== tagId)
                : [...prev.tagIds, tagId],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const url = editingWork ? `/api/works/${editingWork.id}` : '/api/works';
            const method = editingWork ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    metrics: {
                        hipFocusScore: formData.hipFocusScore,
                        cameraFocusScore: formData.cameraFocusScore,
                        outfitEmphasisScore: formData.outfitEmphasisScore,
                        danceFitnessScore: formData.danceFitnessScore,
                        overallPickScore: formData.overallPickScore,
                    },
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed');
            }

            handleCloseModal();
            fetchWorks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (work: WorkData) => {
        if (!confirm(`作品「${work.title}」を削除しますか？`)) {
            return;
        }

        try {
            const res = await fetch(`/api/works/${work.id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to delete');
            }
            fetchWorks();
        } catch (err) {
            alert('削除に失敗しました');
            console.error(err);
        }
    };

    const handleTogglePublish = async (work: WorkData) => {
        try {
            const res = await fetch(`/api/works/${work.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: work.title,
                    description: work.description,
                    thumbnailUrl: work.thumbnailUrl,
                    affiliateUrl: work.affiliateUrl,
                    tagIds: work.tags.map(t => t.tagId),
                    isPublished: !work.isPublished,
                    releaseDate: work.releaseDate,
                }),
            });
            if (res.ok) {
                fetchWorks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // スコア入力用のスライダーコンポーネント
    const ScoreSlider = ({ label, value, field, description }: { label: string; value: number; field: keyof typeof formData; description: string }) => (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                <span className="text-sm font-bold text-pink-400">{value.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500">{description}</p>
            <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={value}
                onChange={(e) => setFormData(prev => ({ ...prev, [field]: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        作品管理
                    </h1>
                    <p className="text-gray-400">{works.length} 作品</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-700"
                >
                    <Plus className="h-4 w-4" />
                    新規作品
                </button>
            </div>

            {/* Works Table */}
            <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">画像</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">タイトル</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">タグ</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">総合スコア</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">状態</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">更新日</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {works.map((work) => (
                                <tr key={work.id} className="hover:bg-gray-700/50">
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{work.id}</td>
                                    <td className="px-4 py-3">
                                        {work.thumbnailUrl ? (
                                            <img
                                                src={work.thumbnailUrl}
                                                alt={work.title}
                                                className="w-16 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/works/${work.id}`} className="text-white hover:text-pink-400 transition-colors line-clamp-1">
                                            {work.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {work.tags.slice(0, 2).map((wt) => (
                                                <span key={wt.tagId} className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs">
                                                    {wt.tag.name}
                                                </span>
                                            ))}
                                            {work.tags.length > 2 && (
                                                <span className="px-2 py-0.5 text-gray-500 text-xs">+{work.tags.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-yellow-400 font-medium">
                                            <Star className="h-4 w-4 fill-current" />
                                            {work.metrics?.overallPickScore?.toFixed(1) ?? '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleTogglePublish(work)}
                                            className={`px-2 py-1 rounded-full text-xs ${work.isPublished
                                                ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
                                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                                }`}
                                        >
                                            {work.isPublished ? '公開' : '非公開'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {new Date(work.updatedAt).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(work)}
                                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                                                title="編集"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(work)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {works.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        作品がありません
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">
                                {editingWork ? '作品を編集' : '新規作品作成'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    タイトル <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                    placeholder="作品タイトル"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    説明
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
                                    placeholder="作品の説明"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        サムネイルURL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnailUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        アフィリエイトURL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.affiliateUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, affiliateUrl: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    リリース日
                                </label>
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    タグ
                                </label>
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => handleTagToggle(tag.id)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.tagIds.includes(tag.id)
                                                ? 'bg-pink-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                    {tags.length === 0 && (
                                        <span className="text-gray-500 text-sm">タグがありません</span>
                                    )}
                                </div>
                            </div>

                            {/* スコア編集セクション */}
                            <div className="rounded-lg border border-gray-700 p-4 bg-gray-900/50">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    スコア評価 (10点満点)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ScoreSlider
                                        label="ヒップフォーカス度"
                                        value={formData.hipFocusScore}
                                        field="hipFocusScore"
                                        description="お尻がどれだけメインで映っているか"
                                    />
                                    <ScoreSlider
                                        label="カメラワーク"
                                        value={formData.cameraFocusScore}
                                        field="cameraFocusScore"
                                        description="カメラアングル・撮影技術の評価"
                                    />
                                    <ScoreSlider
                                        label="衣装・演出"
                                        value={formData.outfitEmphasisScore}
                                        field="outfitEmphasisScore"
                                        description="衣装選び・シチュエーション設定の評価"
                                    />
                                    <ScoreSlider
                                        label="ダンス・動き"
                                        value={formData.danceFitnessScore}
                                        field="danceFitnessScore"
                                        description="動的なシーンの質を評価"
                                    />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <ScoreSlider
                                        label="総合評価"
                                        value={formData.overallPickScore}
                                        field="overallPickScore"
                                        description="上記を総合した推奨度"
                                    />
                                </div>
                            </div>

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
                                            公開
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-4 w-4" />
                                            非公開
                                        </>
                                    )}
                                </span>
                            </div>

                            {formData.thumbnailUrl && (
                                <div className="p-3 bg-gray-900 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-2">サムネイルプレビュー:</p>
                                    <img
                                        src={formData.thumbnailUrl}
                                        alt="プレビュー"
                                        className="max-h-32 rounded object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 text-white rounded-lg transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? '保存中...' : '保存'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
