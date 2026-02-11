import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: 公開動画一覧取得
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    try {
        if (isAdmin) {
            // 管理者用：全ての動画を取得
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const videos = await prisma.sampleVideo.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return NextResponse.json(videos);
        } else {
            // 公開用：公開済みの動画のみ取得
            const videos = await prisma.sampleVideo.findMany({
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
            });
            return NextResponse.json(videos);
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}

// POST: 動画新規登録（管理用）
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { title, embedCode, description, thumbnailUrl, isPublished } = data;

        if (!title || !embedCode) {
            return NextResponse.json(
                { error: 'Title and embed code are required' },
                { status: 400 }
            );
        }

        const video = await prisma.sampleVideo.create({
            data: {
                title,
                embedCode,
                description,
                thumbnailUrl,
                isPublished: isPublished || false,
            },
        });

        return NextResponse.json(video);
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json(
            { error: 'Failed to create video' },
            { status: 500 }
        );
    }
}
