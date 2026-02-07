import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tags - タグ一覧
export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { works: true },
                },
            },
            orderBy: { displayOrder: 'asc' },
        });

        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}
