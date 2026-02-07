import { Prisma } from '@prisma/client';
import { Tag, Plus } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

type TagWithCount = Prisma.TagGetPayload<{
    include: { _count: { select: { works: true } } };
}>;

async function getTags() {
    return prisma.tag.findMany({
        include: {
            _count: { select: { works: true } },
        },
        orderBy: { displayOrder: 'asc' },
    });
}

export default async function AdminTagsPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/admin/login');
    }

    const tags = await getTags();

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
                <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-700">
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {tags.map((tag: TagWithCount) => (
                                <tr key={tag.id} className="hover:bg-gray-700/50">
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{tag.id}</td>
                                    <td className="px-4 py-3 text-white">{tag.name}</td>
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{tag.slug}</td>
                                    <td className="px-4 py-3 text-gray-400 text-sm line-clamp-1">{tag.description || '-'}</td>
                                    <td className="px-4 py-3 text-gray-400">{tag._count?.works || 0}</td>
                                    <td className="px-4 py-3 text-gray-400">{tag.displayOrder}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
