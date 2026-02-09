import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

// POST /api/tags - 新規タグ作成
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, displayOrder } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: '名前とスラッグは必須です' },
                { status: 400 }
            );
        }

        // スラッグの重複チェック
        const existing = await prisma.tag.findUnique({
            where: { slug },
        });
        if (existing) {
            return NextResponse.json(
                { error: 'このスラッグは既に使用されています' },
                { status: 400 }
            );
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                slug,
                description: description || null,
                displayOrder: displayOrder || 0,
            },
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error('Failed to create tag:', error);
        return NextResponse.json(
            { error: 'タグの作成に失敗しました' },
            { status: 500 }
        );
    }
}
