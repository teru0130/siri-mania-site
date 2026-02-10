import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://siri-mania-site.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [works, tags, articles] = await Promise.all([
        prisma.work.findMany({
            where: { isPublished: true },
            select: { id: true, updatedAt: true },
        }),
        prisma.tag.findMany({
            select: { slug: true },
        }),
        prisma.article.findMany({
            where: { isPublished: true },
            select: { slug: true, updatedAt: true },
        }),
    ]);

    const workUrls = works.map((work) => ({
        url: `${BASE_URL}/works/${work.id}`,
        lastModified: work.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const tagUrls = tags.map((tag) => ({
        url: `${BASE_URL}/tags/${tag.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    const articleUrls = articles.map((article) => ({
        url: `${BASE_URL}/articles/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/ranking/weekly`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/tags`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/guide`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...workUrls,
        ...tagUrls,
        ...articleUrls,
    ];
}
