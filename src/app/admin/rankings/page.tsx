import { TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RankingRecalculateButton from '@/components/admin/RankingRecalculateButton';

async function getRankingStats() {
    const weeklyCount = await prisma.ranking.count({ where: { periodType: 'weekly' } });
    const monthlyCount = await prisma.ranking.count({ where: { periodType: 'monthly' } });

    const latestWeekly = await prisma.ranking.findFirst({
        where: { periodType: 'weekly' },
        orderBy: { periodStart: 'desc' },
        include: { work: true },
    });

    const latestMonthly = await prisma.ranking.findFirst({
        where: { periodType: 'monthly' },
        orderBy: { periodStart: 'desc' },
        include: { work: true },
    });

    return { weeklyCount, monthlyCount, latestWeekly, latestMonthly };
}

export default async function AdminRankingsPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/admin/login');
    }

    const stats = await getRankingStats();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        ランキング管理
                    </h1>
                    <p className="text-gray-400">ランキング状況</p>
                </div>
                <RankingRecalculateButton />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">週間ランキング</h2>
                    <p className="text-3xl font-bold text-white mb-2">{stats.weeklyCount}</p>
                    <p className="text-sm text-gray-400">エントリー数</p>
                    {stats.latestWeekly && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400">最新期間</p>
                            <p className="text-white">
                                {new Date(stats.latestWeekly.periodStart).toLocaleDateString('ja-JP')}週
                            </p>
                        </div>
                    )}
                </div>

                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">月間ランキング</h2>
                    <p className="text-3xl font-bold text-white mb-2">{stats.monthlyCount}</p>
                    <p className="text-sm text-gray-400">エントリー数</p>
                    {stats.latestMonthly && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400">最新期間</p>
                            <p className="text-white">
                                {new Date(stats.latestMonthly.periodStart).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">ランキングについて</h2>
                <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• 週間ランキングは毎週月曜日 4:00 に自動更新されます</li>
                    <li>• 月間ランキングは毎月1日 4:00 に自動更新されます</li>
                    <li>• クリック数に基づいて順位が決定されます</li>
                    <li>• 「再計算実行」ボタンで即時更新も可能です</li>
                </ul>
            </div>
        </div>
    );
}
