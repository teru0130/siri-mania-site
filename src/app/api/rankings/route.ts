import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/rankings - ランキング取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'weekly';
        const limit = parseInt(searchParams.get('limit') || '20');

        // 最新の期間のランキングを取得
        const latestRanking = await prisma.ranking.findFirst({
            where: { periodType: period },
            orderBy: { periodStart: 'desc' },
        });

        if (!latestRanking) {
            return NextResponse.json({ rankings: [], period });
        }

        const rankings = await prisma.ranking.findMany({
            where: {
                periodType: period,
                periodStart: latestRanking.periodStart,
            },
            include: {
                work: {
                    include: {
                        metrics: true,
                        tags: { include: { tag: true } },
                    },
                },
            },
            orderBy: { rank: 'asc' },
            take: limit,
        });

        return NextResponse.json({
            rankings,
            period,
            periodStart: latestRanking.periodStart,
        });
    } catch (error) {
        console.error('Failed to fetch rankings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rankings' },
            { status: 500 }
        );
    }
}
