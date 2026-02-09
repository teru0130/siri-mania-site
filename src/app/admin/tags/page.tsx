'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Save } from 'lucide-react';

interface TagData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    displayOrder: number;
    _count?: { works: number };
}

export default function AdminTagsPage() {
    const [tags, setTags] = useState<TagData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTag, setEditingTag] = useState<TagData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        displayOrder: 0,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchTags = useCallback(async () => {
        try {
            const res = await fetch('/api/tags');
            const data = await res.json();
            setTags(data.tags || []);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleOpenModal = (tag?: TagData) => {
        if (tag) {
            setEditingTag(tag);
            setFormData({
                name: tag.name,
                slug: tag.slug,
                description: tag.description || '',
                displayOrder: tag.displayOrder,
            });
        } else {
            setEditingTag(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                displayOrder: 0,
            });
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTag(null);
        setError('');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: !editingTag ? generateSlug(name) : prev.slug,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const url = editingTag ? `/api/tags/${editingTag.id}` : '/api/tags';
            const method = editingTag ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed');
            }

            handleCloseModal();
            fetchTags();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tag: TagData) => {
        if (!confirm(`タグ「${tag.name}」を削除しますか？\n※このタグに紐づく作品との関連も解除されます。`)) {
            return;
        }

        try {
            const res = await fetch(`/api/tags/${tag.id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to delete');
            }
            fetchTags();
        } catch (err) {
            alert('削除に失敗しました');
            console.error(err);
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
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Tag className="h-6 w-6" />
                        タグ管理
                    </h1>
                    <p className="text-gray-400">{tags.length} タグ</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-700"
                >
                    <Plus className="h-4 w-4" />
                    新規タグ
                </button>
            </div>

            {/* Tags Table */}
            <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">名前</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">Slug</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">説明</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">作品数</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">表示順</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {tags.map((tag) => (
                                <tr key={tag.id} className="hover:bg-gray-700/50">
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{tag.id}</td>
                                    <td className="px-4 py-3 text-white font-medium">{tag.name}</td>
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{tag.slug}</td>
                                    <td className="px-4 py-3 text-gray-400 text-sm line-clamp-1">{tag.description || '-'}</td>
                                    <td className="px-4 py-3 text-gray-400">{tag._count?.works || 0}</td>
                                    <td className="px-4 py-3 text-gray-400">{tag.displayOrder}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(tag)}
                                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                                                title="編集"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tags.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        タグがありません
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">
                                {editingTag ? 'タグを編集' : '新規タグ作成'}
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
                                    名前 <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                    placeholder="タグ名"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    スラッグ <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                    placeholder="tag-slug"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    説明
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
                                    placeholder="タグの説明（任意）"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    表示順
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                />
                            </div>

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
