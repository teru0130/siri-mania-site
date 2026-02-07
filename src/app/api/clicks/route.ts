import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/clicks - クリックイベント記録
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pageType, pageId, linkType, destination, workId } = body;

        if (!pageType || !linkType || !destination) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const userAgent = request.headers.get('user-agent') || undefined;
        const referer = request.headers.get('referer') || undefined;

        await prisma.clickEvent.create({
            data: {
                pageType,
                pageId: pageId ? parseInt(pageId) : null,
                linkType,
                destination,
                workId: workId ? parseInt(workId) : null,
                userAgent,
                referer,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to record click:', error);
        return NextResponse.json(
            { error: 'Failed to record click' },
            { status: 500 }
        );
    }
}
