import { Prisma } from '@prisma/client';
import { Package, Plus } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type WorkWithRelations = Prisma.WorkGetPayload<{
    include: {
        tags: { include: { tag: true } };
        metrics: true;
    };
}>;

async function getWorks() {
    return prisma.work.findMany({
        include: {
            tags: { include: { tag: true } },
            metrics: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });
}

export default async function AdminWorksPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/admin/login');
    }

    const works = await getWorks();

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
                <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-700">
                    <Plus className="h-4 w-4" />
                    API同期実行
                </button>
            </div>

            {/* Works Table */}
            <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-800/50">
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">タイトル</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">タグ</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">スコア</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">状態</th>
                                <th className="px-4 py-3 text-left text-gray-400 font-medium">更新日</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {works.map((work: WorkWithRelations) => (
                                <tr key={work.id} className="hover:bg-gray-700/50">
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{work.id}</td>
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
                                        {work.metrics ? (
                                            <span className="text-yellow-400">{work.metrics.overallPickScore.toFixed(1)}</span>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {work.isPublished ? (
                                            <span className="px-2 py-1 rounded-full bg-green-900/50 text-green-400 text-xs">公開</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-400 text-xs">非公開</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {new Date(work.updatedAt).toLocaleDateString('ja-JP')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
