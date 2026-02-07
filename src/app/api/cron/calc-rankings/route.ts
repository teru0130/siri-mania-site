import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Vercel Cron認証
function verifyCronAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        return process.env.NODE_ENV === 'development';
    }

    return authHeader === `Bearer ${cronSecret}`;
}

// POST /api/cron/calc-rankings - ランキング再計算
export async function POST(request: NextRequest) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // 週間ランキング計算（過去7日間のクリック数）
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyClicks = await prisma.clickEvent.groupBy({
            by: ['workId'],
            where: {
                workId: { not: null },
                createdAt: { gte: weekAgo },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 100,
        });

        // 週間ランキング保存
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 週の始まり（日曜）

        for (let i = 0; i < weeklyClicks.length; i++) {
            const click = weeklyClicks[i];
            if (click.workId) {
                await prisma.ranking.upsert({
                    where: {
                        periodType_periodStart_workId: {
                            periodType: 'weekly',
                            periodStart: weekStart,
                            workId: click.workId,
                        },
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
                    },
                });
            }
        }

        // 月間ランキング計算（過去30日間のクリック数）
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthlyClicks = await prisma.clickEvent.groupBy({
            by: ['workId'],
            where: {
                workId: { not: null },
                createdAt: { gte: monthAgo },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 100,
        });

        // 月間ランキング保存
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
                        },
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
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            weeklyCount: weeklyClicks.length,
            monthlyCount: monthlyClicks.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Calculate rankings failed:', error);
        return NextResponse.json(
            { error: 'Calculation failed', details: String(error) },
            { status: 500 }
        );
    }
}

// GET for health check
export async function GET(request: NextRequest) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ status: 'ok', job: 'calc-rankings' });
}
