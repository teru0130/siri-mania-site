import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchWorks, transformDMMItem } from '@/lib/affiliate-api';

// Vercel Cron認証
function verifyCronAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        // 開発環境では認証スキップ
        return process.env.NODE_ENV === 'development';
    }

    return authHeader === `Bearer ${cronSecret}`;
}

// POST /api/cron/sync-works - アフィリエイトAPI同期
export async function POST(request: NextRequest) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // お尻関連のキーワードで検索
        const keywords = ['美尻', 'ヒップ', 'お尻'];
        let syncedCount = 0;

        for (const keyword of keywords) {
            try {
                const response = await searchWorks({ keyword, hits: 50 });

                if (response.result?.items) {
                    for (const item of response.result.items) {
                        const workData = transformDMMItem(item);

                        await prisma.work.upsert({
                            where: { externalId: workData.externalId },
                            update: {
                                ...workData,
                                actresses: workData.actresses,
                                syncedAt: new Date(),
                            },
                            create: {
                                ...workData,
                                actresses: workData.actresses,
                                syncedAt: new Date(),
                            },
                        });

                        syncedCount++;
                    }
                }
            } catch (error) {
                console.error(`Failed to sync keyword "${keyword}":`, error);
            }
        }

        return NextResponse.json({
            success: true,
            syncedCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Sync works failed:', error);
        return NextResponse.json(
            { error: 'Sync failed', details: String(error) },
            { status: 500 }
        );
    }
}

// GET for health check
export async function GET(request: NextRequest) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ status: 'ok', job: 'sync-works' });
}
