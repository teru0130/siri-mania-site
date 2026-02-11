'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ExternalLink, Eye, EyeOff, Film } from 'lucide-react';

interface Video {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    isPublished: boolean;
    createdAt: string;
}

export default function AdminVideosPage() {
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/videos?admin=true');
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('本当にこの動画を削除してもよろしいですか？')) return;

        try {
            const res = await fetch(`/api/videos/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setVideos(videos.filter(v => v.id !== id));
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('Failed to delete video:', error);
            alert('削除エラーが発生しました');
        }
    };

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">動画管理</h1>
                    <p className="text-gray-400">サンプル動画の登録・編集・削除を行います</p>
                </div>
                <Link
                    href="/admin/videos/new"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
                >
                    <Plus className="h-4 w-4" />
                    新規登録
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="動画を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                    />
                </div>
            </div>

            {/* Videos Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-950/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">動画</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">ステータス</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">公開日</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredVideos.length > 0 ? (
                                filteredVideos.map((video) => (
                                    <tr key={video.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-20 bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {video.thumbnailUrl ? (
                                                        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Film className="h-6 w-6 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white line-clamp-1">
                                                        {video.title}
                                                    </div>
                                                    {video.description && (
                                                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                            {video.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${video.isPublished
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
                                                }`}>
                                                {video.isPublished ? (
                                                    <>
                                                        <Eye className="h-3 w-3" />
                                                        公開中
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-3 w-3" />
                                                        下書き
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300">
                                                {new Date(video.createdAt).toLocaleDateString('ja-JP')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(video.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/videos/${video.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                                    title="編集"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(video.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                                                    title="削除"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        動画が見つかりませんでした
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
