import { Prisma } from '@prisma/client';
import { Package, Tag, TrendingUp, MousePointerClick, Clock } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

type ClickEventWithWork = Prisma.ClickEventGetPayload<{
    include: { work: { select: { title: true } } };
}>;

async function getDashboardStats() {
    const [worksCount, tagsCount, clicksToday, clicksTotal] = await Promise.all([
        prisma.work.count({ where: { isPublished: true } }),
        prisma.tag.count(),
        prisma.clickEvent.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        prisma.clickEvent.count(),
    ]);

    // 最近のクリック
    const recentClicks = await prisma.clickEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { work: { select: { title: true } } },
    });

    return { worksCount, tagsCount, clicksToday, clicksTotal, recentClicks };
}

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/admin/login');
    }

    const stats = await getDashboardStats();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
                <p className="text-gray-400">サイト概況</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                            <Package className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.worksCount}</p>
                            <p className="text-sm text-gray-400">作品数</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                            <Tag className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.tagsCount}</p>
                            <p className="text-sm text-gray-400">タグ数</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                            <MousePointerClick className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.clicksToday}</p>
                            <p className="text-sm text-gray-400">本日のクリック</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/20">
                            <TrendingUp className="h-6 w-6 text-pink-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.clicksTotal}</p>
                            <p className="text-sm text-gray-400">総クリック数</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Clicks */}
            <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    最近のクリック
                </h2>
                {stats.recentClicks.length === 0 ? (
                    <p className="text-gray-400 text-sm">クリックデータがありません</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 text-left">
                                    <th className="pb-3 text-gray-400 font-medium">作品</th>
                                    <th className="pb-3 text-gray-400 font-medium">リンク種別</th>
                                    <th className="pb-3 text-gray-400 font-medium">日時</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {stats.recentClicks.map((click: ClickEventWithWork) => (
                                    <tr key={click.id.toString()}>
                                        <td className="py-3 text-white">
                                            {click.work?.title || '-'}
                                        </td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs">
                                                {click.linkType}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-400">
                                            {new Date(click.createdAt).toLocaleString('ja-JP')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
