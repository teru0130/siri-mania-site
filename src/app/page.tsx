import Link from 'next/link';
import { TrendingUp, Sparkles, Tag, BookOpen, ArrowRight, Star, Flame } from 'lucide-react';
import prisma from '@/lib/prisma';
import WorkCard from '@/components/WorkCard';

export const dynamic = 'force-dynamic';


async function getHomeData() {
  try {
    // 最新作品
    const latestWorks = await prisma.work.findMany({
      where: { isPublished: true },
      include: {
        tags: { include: { tag: true } },
        metrics: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // 高スコア作品
    const topRatedWorks = await prisma.work.findMany({
      where: {
        isPublished: true,
        metrics: { overallPickScore: { gte: 7 } }
      },
      include: {
        tags: { include: { tag: true } },
        metrics: true,
      },
      orderBy: { metrics: { overallPickScore: 'desc' } },
      take: 4,
    });

    // タグ一覧
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { works: true } },
      },
      orderBy: { displayOrder: 'asc' },
      take: 12,
    });

    // 統計
    const totalWorks = await prisma.work.count({ where: { isPublished: true } });
    const totalTags = await prisma.tag.count();

    return { latestWorks, topRatedWorks, tags, stats: { totalWorks, totalTags } };
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    return { latestWorks: [], topRatedWorks: [], tags: [], stats: { totalWorks: 0, totalTags: 0 } };
  }
}

export default async function HomePage() {
  const { latestWorks, topRatedWorks, tags, stats } = await getHomeData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm text-pink-400 mb-6 animate-fade-in-up">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>尻好きのためのお尻に特化したおすすめav作品サイト。</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">尻マニア</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/ranking/weekly"
            className="btn-glow flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3 font-semibold text-white"
          >
            <TrendingUp className="h-5 w-5" />
            ランキングを見る
          </Link>
          <Link
            href="/tags"
            className="flex items-center gap-2 rounded-lg glass-card px-6 py-3 font-semibold text-white hover:border-pink-500/30 transition-all"
          >
            <Tag className="h-5 w-5" />
            タグから探す
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className="rounded-xl stat-card p-4 sm:p-6 text-center group hover:scale-105 transition-transform duration-300">
          <p className="text-2xl sm:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors">{stats.totalWorks.toLocaleString()}</p>
          <p className="text-gray-400 text-xs sm:text-sm">作品数</p>
        </div>
        <div className="rounded-xl stat-card p-4 sm:p-6 text-center group hover:scale-105 transition-transform duration-300">
          <p className="text-2xl sm:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors">{stats.totalTags}</p>
          <p className="text-gray-400 text-xs sm:text-sm">タグ数</p>
        </div>
        <div className="rounded-xl stat-card p-4 sm:p-6 text-center group hover:scale-105 transition-transform duration-300">
          <p className="text-2xl sm:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors">5</p>
          <p className="text-gray-400 text-xs sm:text-sm">評価項目</p>
        </div>
      </section>

      {/* Top Rated */}
      {topRatedWorks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                <Star className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">高評価作品</h2>
                <p className="text-sm text-gray-400">総合スコア7.0以上</p>
              </div>
            </div>
            <Link href="/compare" className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300">
              すべて見る <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topRatedWorks.map((work) => (
              <WorkCard key={work.id} work={work as never} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Works */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">新着作品</h2>
              <p className="text-sm text-gray-400">最近追加された作品</p>
            </div>
          </div>
          <Link href="/works" className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300">
            すべて見る <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {latestWorks.map((work) => (
            <WorkCard key={work.id} work={work as never} />
          ))}
        </div>
      </section>

      {/* Tags */}
      {tags.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">人気タグ</h2>
                <p className="text-sm text-gray-400">カテゴリから探す</p>
              </div>
            </div>
            <Link href="/tags" className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300">
              すべて見る <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="flex items-center gap-2 rounded-full bg-gray-800 border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-400 transition-all"
              >
                {tag.name}
                {tag._count && (
                  <span className="text-xs text-gray-500">({tag._count.works})</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Guide CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-8 text-center">
        <BookOpen className="h-12 w-12 text-pink-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">初めての方へ</h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          当サイトの使い方、スコアの見方、おすすめの検索方法などを解説しています。
        </p>
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-6 py-3 font-semibold text-white hover:bg-gray-600 transition-all"
        >
          ガイドを読む <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}
