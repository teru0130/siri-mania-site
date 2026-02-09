import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: 記事一覧取得
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    try {
        const where = published === 'true'
            ? { isPublished: true }
            : {};

        const articles = await prisma.article.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        );
    }
}

// POST: 新規記事作成（認証必須）
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { title, slug, excerpt, content, thumbnailUrl, isPublished } = body;

        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Title, slug, and content are required' },
                { status: 400 }
            );
        }

        const article = await prisma.article.create({
            data: {
                title,
                slug,
                excerpt: excerpt || null,
                content,
                thumbnailUrl: thumbnailUrl || null,
                isPublished: isPublished || false,
                publishedAt: isPublished ? new Date() : null,
            },
        });

        return NextResponse.json(article, { status: 201 });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json(
            { error: 'Failed to create article' },
            { status: 500 }
        );
    }
}
