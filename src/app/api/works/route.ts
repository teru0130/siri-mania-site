import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/works - 作品一覧
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const tagSlug = searchParams.get('tag');
        const sort = searchParams.get('sort') || 'createdAt';

        const skip = (page - 1) * limit;

        const where = {
            isPublished: true,
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
