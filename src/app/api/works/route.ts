import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/works - 作品一覧
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const tagSlug = searchParams.get('tag');
        const sort = searchParams.get('sort') || 'createdAt';
        const includeUnpublished = searchParams.get('all') === 'true';

        const skip = (page - 1) * limit;

        const where = {
            ...(includeUnpublished ? {} : { isPublished: true }),
            ...(tagSlug && {
                tags: {
                    some: {
                        tag: { slug: tagSlug },
                    },
                },
            }),
        };

        const orderBy = (() => {
            switch (sort) {
                case 'releaseDate':
                    return { releaseDate: 'desc' as const };
                case 'score':
                    return { metrics: { overallPickScore: 'desc' as const } };
                default:
                    return { createdAt: 'desc' as const };
            }
        })();

        const [works, total] = await Promise.all([
            prisma.work.findMany({
                where,
                include: {
                    category: true,
                    tags: { include: { tag: true } },
                    metrics: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.work.count({ where }),
        ]);

        return NextResponse.json({
            works,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Failed to fetch works:', error);
        return NextResponse.json(
            { error: 'Failed to fetch works' },
            { status: 500 }
        );
    }
}

// POST /api/works - 作品作成
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, thumbnailUrl, affiliateUrl, tagIds, isPublished, releaseDate } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'タイトルは必須です' },
                { status: 400 }
            );
        }

        // externalIdをランダム生成
        const externalId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const work = await prisma.work.create({
            data: {
                externalId,
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

        // メトリクスを作成（デフォルト値で）
        await prisma.workMetrics.create({
            data: {
                workId: work.id,
            },
        });

        return NextResponse.json(work, { status: 201 });
    } catch (error) {
        console.error('Failed to create work:', error);
        return NextResponse.json(
            { error: '作品の作成に失敗しました' },
            { status: 500 }
        );
    }
}

