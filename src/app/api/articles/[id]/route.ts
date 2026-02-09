import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: 記事詳細取得
export async function GET(request: Request, { params }: RouteParams) {
    const { id } = await params;

    try {
        const article = await prisma.article.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json(
            { error: 'Failed to fetch article' },
            { status: 500 }
        );
    }
}

// PUT: 記事更新（認証必須）
export async function PUT(request: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { title, slug, excerpt, content, thumbnailUrl, isPublished } = body;

        const existingArticle = await prisma.article.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!existingArticle) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        // 公開状態が変わった場合に publishedAt を更新
        let publishedAt = existingArticle.publishedAt;
        if (isPublished && !existingArticle.isPublished) {
            publishedAt = new Date();
        } else if (!isPublished) {
            publishedAt = null;
        }

        const article = await prisma.article.update({
            where: { id: parseInt(id, 10) },
            data: {
                title,
                slug,
                excerpt: excerpt || null,
                content,
                thumbnailUrl: thumbnailUrl || null,
                isPublished,
                publishedAt,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json(
            { error: 'Failed to update article' },
            { status: 500 }
        );
    }
}

// DELETE: 記事削除（認証必須）
export async function DELETE(request: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const { id } = await params;

    try {
        await prisma.article.delete({
            where: { id: parseInt(id, 10) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json(
            { error: 'Failed to delete article' },
            { status: 500 }
        );
    }
}
