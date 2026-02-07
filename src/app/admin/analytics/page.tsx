import { BarChart3 } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface TopWorkItem {
    workId: number | null;
    _count: { id: number };
    work?: { id: number; title: string } | undefined;
}

interface LinkTypeItem {
    linkType: string;
    _count: { id: number };
}

async function getAnalyticsData() {
    // 人気作品トップ10
    const topWorks = await prisma.clickEvent.groupBy({
        by: ['workId'],
        where: { workId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
    });

    const workIds = topWorks.filter((w): w is typeof w & { workId: number } => w.workId !== null).map(w => w.workId);
    const works = await prisma.work.findMany({
        where: { id: { in: workIds } },
        select: { id: true, title: true },
    });

    const topWorksWithTitles: TopWorkItem[] = topWorks.map((item) => ({
        ...item,
        work: works.find((w) => w.id === item.workId),
    }));

    // リンク種別別クリック
    const clicksByLinkType = await prisma.clickEvent.groupBy({
        by: ['linkType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
    });

    return { topWorksWithTitles, clicksByLinkType };
}

export default async function AdminAnalyticsPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/admin/login');
    }

    const data = await getAnalyticsData();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    アナリティクス
                </h1>
                <p className="text-gray-400">クリック分析</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Works */}
                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">人気作品トップ10</h2>
                    {data.topWorksWithTitles.length === 0 ? (
                        <p className="text-gray-400 text-sm">データがありません</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topWorksWithTitles.map((item: TopWorkItem, index: number) => (
                                <div key={item.workId || index} className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">
                                            {item.work?.title || '(削除済み)'}
                                        </p>
                                    </div>
                                    <span className="text-pink-400 font-semibold">{item._count.id}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Link Type Breakdown */}
                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">リンク種別</h2>
                    {data.clicksByLinkType.length === 0 ? (
                        <p className="text-gray-400 text-sm">データがありません</p>
                    ) : (
                        <div className="space-y-3">
                            {data.clicksByLinkType.map((item: LinkTypeItem) => (
                                <div key={item.linkType} className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm">
                                        {item.linkType}
                                    </span>
                                    <span className="text-white font-semibold">{item._count.id}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
