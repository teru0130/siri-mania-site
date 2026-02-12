import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // ---------------------------------------------------------
        // 週間ランキング計算（過去7日間のクリック数）
        // ---------------------------------------------------------
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyClicks = await prisma.clickEvent.groupBy({
            by: ['workId'],
            where: {
                workId: { not: null },
                createdAt: { gte: weekAgo },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 50, // トップ50のみ
        });

        // 既存の週間ランキングをこの期間について削除するのではなく、新しい期間として保存するか、
        // あるいは現在の「今週」のデータを更新するか。
        // ここでは「今週」として保存する（既存ロジック準拠）。
        // periodStartは「今週の日曜日（または月曜日）」にするのが一般的。

        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 日曜始まり

        // トランザクションまたはループで更新
        for (let i = 0; i < weeklyClicks.length; i++) {
            const click = weeklyClicks[i];
            if (click.workId) {
                // Upsert
                await prisma.ranking.upsert({
                    where: {
                        periodType_periodStart_workId: {
                            periodType: 'weekly',
                            periodStart: weekStart,
                            workId: click.workId,
                        }
                    },
                    update: {
                        rank: i + 1,
                        clickCount: click._count.id,
                    },
                    create: {
                        periodType: 'weekly',
                        periodStart: weekStart,
                        workId: click.workId,
                        rank: i + 1,
                        clickCount: click._count.id,
                    }
                });
            }
        }

        // ---------------------------------------------------------
        // 月間ランキング計算（過去30日間のクリック数）
        // ---------------------------------------------------------
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthlyClicks = await prisma.clickEvent.groupBy({
            by: ['workId'],
            where: {
                workId: { not: null },
                createdAt: { gte: monthAgo },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 50,
        });

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        for (let i = 0; i < monthlyClicks.length; i++) {
            const click = monthlyClicks[i];
            if (click.workId) {
                await prisma.ranking.upsert({
                    where: {
                        periodType_periodStart_workId: {
                            periodType: 'monthly',
                            periodStart: monthStart,
                            workId: click.workId,
                        }
                    },
                    update: {
                        rank: i + 1,
                        clickCount: click._count.id,
                    },
                    create: {
                        periodType: 'monthly',
                        periodStart: monthStart,
                        workId: click.workId,
                        rank: i + 1,
                        clickCount: click._count.id,
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Rankings recalculated successfully',
            stats: {
                weekly: weeklyClicks.length,
                monthly: monthlyClicks.length
            }
        });

    } catch (error) {
        console.error('Recalculation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
