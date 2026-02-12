import Link from 'next/link';
import { TrendingUp, Sparkles, Tag, BookOpen, ArrowRight, Flame, FileText } from 'lucide-react';
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

    return { latestWorks, tags, stats: { totalWorks, totalTags } };
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    return { latestWorks: [], tags: [], stats: { totalWorks: 0, totalTags: 0 } };
  }
}

export default async function HomePage() {
  const { latestWorks, tags, stats } = await getHomeData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm text-pink-400 mb-6 animate-fade-in-up">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>尻好きのためのお尻に特化したおすすめav作品サイト。</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">お尻マニア</span>
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
            href="/articles"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-all"
          >
            <FileText className="h-5 w-5" />
            おすすめお尻作品記事一覧
          </Link>
          <Link
            href="/tags"
            className="flex items-center gap-2 rounded-lg glass-card px-6 py-3 font-semibold text-white hover:border-pink-500/30 transition-all"
          >
            タグから探す
          </Link>
          <Link
            href="/videos"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 font-semibold text-white hover:opacity-90 transition-all shadow-lg shadow-red-500/20"
          >
            <div className="flex items-center justify-center bg-white/20 rounded-full w-5 h-5">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            サンプル動画を見る
          </Link>
        </div>
      </section>

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
