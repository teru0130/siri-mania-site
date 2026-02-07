import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            passwordHash,
        },
    });
    console.log('✓ Admin user created (admin@example.com / admin123)');

    // Create category
    const category = await prisma.category.upsert({
        where: { slug: 'hip-focus' },
        update: {},
        create: {
            slug: 'hip-focus',
            name: 'お尻特化',
            description: 'お尻・ヒップに特化した作品カテゴリ',
        },
    });
    console.log('✓ Category created');

    // Delete all existing tags and work-tag relations
    await prisma.workTag.deleteMany({});
    await prisma.tag.deleteMany({});
    console.log('✓ Existing tags cleared');

    // Create new tags
    const tags = [
        { slug: 'facesitting', name: '顔面騎乗', description: '顔面騎乗プレイ', displayOrder: 1 },
        { slug: 'assjob', name: '尻コキ', description: '尻コキプレイ', displayOrder: 2 },
        { slug: 'big-ass', name: 'デカ尻', description: 'デカ尻・巨尻', displayOrder: 3 },
    ];

    for (const tagData of tags) {
        await prisma.tag.upsert({
            where: { slug: tagData.slug },
            update: tagData,
            create: tagData,
        });
    }
    console.log(`✓ ${tags.length} tags created`);

    // Create sample works
    const sampleWorks = [
        {
            externalId: 'sample001',
            title: 'サンプル作品1 - 顔面騎乗コレクション',
            description: 'サンプルとして作成された作品データです。',
            thumbnailUrl: null,
            affiliateUrl: 'https://example.com/affiliate/001',
            makerName: 'サンプルスタジオ',
            makerId: 'maker001',
            releaseDate: new Date('2025-01-15'),
            durationMinutes: 120,
            actresses: ['サンプル出演者A', 'サンプル出演者B'],
            isPublished: true,
            categoryId: category.id,
        },
        {
            externalId: 'sample002',
            title: 'サンプル作品2 - デカ尻フェチ',
            description: 'サンプルとして作成された作品データです。',
            thumbnailUrl: null,
            affiliateUrl: 'https://example.com/affiliate/002',
            makerName: 'サンプルスタジオ',
            makerId: 'maker001',
            releaseDate: new Date('2025-02-01'),
            durationMinutes: 90,
            actresses: ['サンプル出演者C'],
            isPublished: true,
            categoryId: category.id,
        },
    ];

    for (const workData of sampleWorks) {
        const work = await prisma.work.upsert({
            where: { externalId: workData.externalId },
            update: workData,
            create: workData,
        });

        // Add metrics
        await prisma.workMetrics.upsert({
            where: { workId: work.id },
            update: {},
            create: {
                workId: work.id,
                hipFocusScore: Math.random() * 3 + 7,
                cameraFocusScore: Math.random() * 3 + 6,
                outfitEmphasisScore: Math.random() * 3 + 6,
                danceFitnessScore: Math.random() * 3 + 5,
                overallPickScore: Math.random() * 2 + 7,
            },
        });

        // Add tags
        const randomTags = tags.slice(0, Math.floor(Math.random() * 3) + 1);
        for (const tagData of randomTags) {
            const tag = await prisma.tag.findUnique({ where: { slug: tagData.slug } });
            if (tag) {
                await prisma.workTag.upsert({
                    where: { workId_tagId: { workId: work.id, tagId: tag.id } },
                    update: {},
                    create: { workId: work.id, tagId: tag.id },
                });
            }
        }
    }
    console.log(`✓ ${sampleWorks.length} sample works created`);

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
