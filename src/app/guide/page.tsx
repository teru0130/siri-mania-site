import Link from 'next/link';
import { BookOpen, ArrowLeft, Star, Tag, TrendingUp, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ガイド - お尻マニア',
    description: 'サイトの使い方・スコアの見方ガイド',
};

export default function GuidePage() {
    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
            {/* Back Link */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
                <ArrowLeft className="h-4 w-4" />
                トップに戻る
            </Link>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">ガイド</h1>
                        <p className="text-gray-400 text-sm sm:text-base">サイトの使い方・スコアの見方</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6 sm:space-y-8">
                {/* About */}
                <section className="rounded-xl bg-gray-800 border border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-pink-400" />
                        お尻マニアについて
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                        お尻マニアは、お尻・ヒップに特化したAV作品のおすすめサイトです。
                        あなたの好みに合った作品を効率的に見つけることができます。
                    </p>
                </section>

                {/* Score Guide */}
                <section className="rounded-xl bg-gray-800 border border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        スコアの見方
                    </h2>
                    <div className="space-y-3 sm:space-y-4 text-gray-300">
                        <div className="border-l-4 border-pink-500 pl-3 sm:pl-4">
                            <h3 className="font-semibold text-white text-sm sm:text-base">ヒップフォーカス度（10点満点）</h3>
                            <p className="text-xs sm:text-sm">お尻がどれだけメインで映っているかを評価</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                            <h3 className="font-semibold text-white text-sm sm:text-base">カメラワーク（10点満点）</h3>
                            <p className="text-xs sm:text-sm">カメラアングル・撮影技術の評価</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-3 sm:pl-4">
                            <h3 className="font-semibold text-white text-sm sm:text-base">衣装・演出（10点満点）</h3>
                            <p className="text-xs sm:text-sm">衣装選び・シチュエーション設定の評価</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                            <h3 className="font-semibold text-white text-sm sm:text-base">ダンス・動き（10点満点）</h3>
                            <p className="text-xs sm:text-sm">動的なシーンの質を評価</p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4">
                            <h3 className="font-semibold text-white text-sm sm:text-base">総合評価（10点満点）</h3>
                            <p className="text-xs sm:text-sm">上記を総合した推奨度</p>
                        </div>
                    </div>
                </section>

                {/* How to Search */}
                <section className="rounded-xl bg-gray-800 border border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-purple-400" />
                        作品の探し方
                    </h2>
                    <div className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>1. <strong>タグから探す</strong> - 気になるジャンル・シチュエーションから作品を絞り込めます</p>
                        <p>2. <strong>ランキングから探す</strong> - 人気作品を週間・月間でチェックできます</p>
                    </div>
                </section>

                {/* Ranking */}
                <section className="rounded-xl bg-gray-800 border border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-400" />
                        ランキングについて
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                        ランキングは、サイト内でのクリック数を集計して自動生成されます。
                        週間ランキングは毎週月曜日、月間ランキングは毎月1日に更新されます。
                    </p>
                </section>

                {/* Articles */}
                <section className="rounded-xl bg-gray-800 border border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-cyan-400" />
                        おすすめ記事について
                    </h2>
                    <div className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>
                            おすすめ記事では、お尻フェチ向けのAV作品を独自の視点で紹介・レビューしています。
                        </p>
                        <p>
                            <strong>記事の内容：</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>作品の見どころポイント</li>
                            <li>おすすめシーン解説</li>
                            <li>シチュエーション・衣装の評価</li>
                            <li>類似作品との比較</li>
                        </ul>
                        <p className="pt-2">
                            <Link href="/articles" className="text-pink-400 hover:text-pink-300 underline">
                                記事一覧はこちら →
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
