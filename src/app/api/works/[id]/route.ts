import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/works/[id] - 作品詳細
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const workId = parseInt(id);

        if (isNaN(workId)) {
            return NextResponse.json(
                { error: 'Invalid work ID' },
                { status: 400 }
            );
        }

        const work = await prisma.work.findUnique({
            where: { id: workId, isPublished: true },
            include: {
                category: true,
                tags: { include: { tag: true } },
                metrics: true,
            },
        });

        if (!work) {
            return NextResponse.json(
                { error: 'Work not found' },
                { status: 404 }
            );
        }

        // 関連作品を取得（同じタグを持つ作品）
        const tagIds = work.tags.map(t => t.tagId);
        const relatedWorks = await prisma.work.findMany({
            where: {
                id: { not: work.id },
                isPublished: true,
                tags: {
                    some: { tagId: { in: tagIds } },
                },
            },
            include: {
                metrics: true,
            },
            take: 6,
            orderBy: {
                metrics: { overallPickScore: 'desc' },
            },
        });

        return NextResponse.json({ work, relatedWorks });
    } catch (error) {
        console.error('Failed to fetch work:', error);
        return NextResponse.json(
            { error: 'Failed to fetch work' },
            { status: 500 }
        );
    }
}
