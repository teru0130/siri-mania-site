import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/tags/[id] - タグ詳細
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tag = await prisma.tag.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: { select: { works: true } },
            },
        });

        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json(tag);
    } catch (error) {
        console.error('Failed to fetch tag:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tag' },
            { status: 500 }
        );
    }
}

// PUT /api/tags/[id] - タグ更新
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
        const body = await request.json();
        const { name, slug, description, displayOrder } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: '名前とスラッグは必須です' },
                { status: 400 }
            );
        }

        // スラッグの重複チェック（自分自身は除外）
        const existing = await prisma.tag.findFirst({
            where: {
                slug,
                NOT: { id: parseInt(id) },
            },
        });
        if (existing) {
            return NextResponse.json(
                { error: 'このスラッグは既に使用されています' },
                { status: 400 }
            );
        }

        const tag = await prisma.tag.update({
            where: { id: parseInt(id) },
            data: {
                name,
                slug,
                description: description || null,
                displayOrder: displayOrder ?? 0,
            },
        });

        return NextResponse.json(tag);
    } catch (error) {
        console.error('Failed to update tag:', error);
        return NextResponse.json(
            { error: 'タグの更新に失敗しました' },
            { status: 500 }
        );
    }
}

// DELETE /api/tags/[id] - タグ削除
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

        await prisma.tag.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete tag:', error);
        return NextResponse.json(
            { error: 'タグの削除に失敗しました' },
            { status: 500 }
        );
    }
}
