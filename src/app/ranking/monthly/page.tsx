import Link from 'next/link';
import { TrendingUp, ArrowLeft, Trophy } from 'lucide-react';
import prisma from '@/lib/prisma';
import WorkCard from '@/components/WorkCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
    title: '月間ランキング - 尻マニア',
    description: '月間人気作品ランキング',
};

async function getMonthlyRankings() {
    const latestRanking = await prisma.ranking.findFirst({
        where: { periodType: 'monthly' },
        orderBy: { periodStart: 'desc' },
    });

    if (!latestRanking) return { rankings: [], periodStart: null };

    const rankings = await prisma.ranking.findMany({
        where: {
            periodType: 'monthly',
            periodStart: latestRanking.periodStart,
        },
        include: {
            work: {
                include: {
                    tags: { include: { tag: true } },
                    metrics: true,
                },
            },
        },
        orderBy: { rank: 'asc' },
        take: 50,
    });

    return { rankings, periodStart: latestRanking.periodStart };
}

export default async function MonthlyRankingPage() {
    const { rankings, periodStart } = await getMonthlyRankings();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Link */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                トップに戻る
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">月間ランキング</h1>
                        {periodStart && (
                            <p className="text-gray-400">
                                {new Date(periodStart).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2">
                    <Link href="/ranking/weekly" className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
                        週間
                    </Link>
                    <span className="px-4 py-2 rounded-lg bg-pink-500/20 text-pink-400 font-medium">月間</span>
                </div>
            </div>

            {/* Rankings */}
            {rankings.length === 0 ? (
                <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">ランキングデータがありません</p>
                    <p className="text-sm text-gray-500 mt-2">クリックデータが収集されるとランキングが表示されます</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rankings.map((ranking) => (
                        <WorkCard key={ranking.id} work={ranking.work as never} showRank={ranking.rank} />
                    ))}
                </div>
            )}
        </div>
    );
}
