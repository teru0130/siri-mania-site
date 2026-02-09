import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

        // 管理画面用：すべての作品を取得可能に
        const work = await prisma.work.findUnique({
            where: { id: workId },
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

// PUT /api/works/[id] - 作品更新
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const workId = parseInt(id);
        const body = await request.json();
        const { title, description, thumbnailUrl, affiliateUrl, tagIds, isPublished, releaseDate, metrics } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'タイトルは必須です' },
                { status: 400 }
            );
        }

        // 既存のタグ関連を削除
        await prisma.workTag.deleteMany({
            where: { workId },
        });

        const work = await prisma.work.update({
            where: { id: workId },
            data: {
                title,
                description: description || null,
                thumbnailUrl: thumbnailUrl || null,
                affiliateUrl: affiliateUrl || null,
                isPublished: isPublished ?? false,
                releaseDate: releaseDate ? new Date(releaseDate) : null,
                tags: tagIds && tagIds.length > 0 ? {
                    create: tagIds.map((tagId: number) => ({ tagId })),
                } : undefined,
            },
            include: {
                tags: { include: { tag: true } },
                metrics: true,
            },
        });

        // スコアを更新（存在しない場合は作成）
        if (metrics) {
            await prisma.workMetrics.upsert({
                where: { workId },
                update: {
                    hipFocusScore: metrics.hipFocusScore ?? 0,
                    cameraFocusScore: metrics.cameraFocusScore ?? 0,
                    outfitEmphasisScore: metrics.outfitEmphasisScore ?? 0,
                    danceFitnessScore: metrics.danceFitnessScore ?? 0,
                    overallPickScore: metrics.overallPickScore ?? 0,
                },
                create: {
                    workId,
                    hipFocusScore: metrics.hipFocusScore ?? 0,
                    cameraFocusScore: metrics.cameraFocusScore ?? 0,
                    outfitEmphasisScore: metrics.outfitEmphasisScore ?? 0,
                    danceFitnessScore: metrics.danceFitnessScore ?? 0,
                    overallPickScore: metrics.overallPickScore ?? 0,
                },
            });
        }

        // 更新後のworkを再取得（metricsを含めて）
        const updatedWork = await prisma.work.findUnique({
            where: { id: workId },
            include: {
                tags: { include: { tag: true } },
                metrics: true,
            },
        });

        return NextResponse.json(updatedWork);
    } catch (error) {
        console.error('Failed to update work:', error);
        return NextResponse.json(
            { error: '作品の更新に失敗しました' },
            { status: 500 }
        );
    }
}

// DELETE /api/works/[id] - 作品削除
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const workId = parseInt(id);

        // 関連データを削除
        await prisma.workTag.deleteMany({ where: { workId } });
        await prisma.workMetrics.deleteMany({ where: { workId } });

        await prisma.work.delete({
            where: { id: workId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete work:', error);
        return NextResponse.json(
            { error: '作品の削除に失敗しました' },
            { status: 500 }
        );
    }
}
