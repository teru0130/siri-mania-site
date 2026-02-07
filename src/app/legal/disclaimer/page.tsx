import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '免責事項 - 尻マニア',
    description: '尻マニアの免責事項',
};

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                トップに戻る
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
                    <AlertTriangle className="h-6 w-6 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white">免責事項</h1>
            </div>

            <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 space-y-6 text-gray-300">
                <section>
                    <h2 className="text-lg font-bold text-white mb-2">1. 情報の正確性について</h2>
                    <p>当サイトで提供する情報（スコア、作品情報等）は、運営者が独自に評価・収集したものです。情報の正確性・完全性について保証するものではありません。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">2. 外部リンクについて</h2>
                    <p>当サイトからリンクするサービス（DMM/FANZA等）については、各サービス提供者の責任において運営されています。リンク先での商品購入・サービス利用について、当サイトは一切の責任を負いません。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">3. スコア・評価について</h2>
                    <p>当サイトで提供するスコア・評価は、運営者の主観的な判断に基づくものであり、作品の品質を保証するものではありません。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">4. サービスの変更・中断</h2>
                    <p>当サイトは、予告なくサービス内容を変更、または中断する場合があります。これにより生じた損害について、運営者は一切の責任を負いません。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">5. 著作権について</h2>
                    <p>当サイトで使用している画像・サムネイルは、アフィリエイトプログラムを通じて提供される公式素材を使用しています。無断転載・二次利用は禁止されています。</p>
                </section>

                <p className="text-sm text-gray-500 mt-8">最終更新日: 2026年2月8日</p>
            </div>
        </div>
    );
}
