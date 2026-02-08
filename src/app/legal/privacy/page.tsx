import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'プライバシーポリシー - お尻マニア',
    description: 'お尻マニアのプライバシーポリシー',
};

export default function PrivacyPage() {
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">プライバシーポリシー</h1>
            </div>

            <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 space-y-6 text-gray-300">
                <section>
                    <h2 className="text-lg font-bold text-white mb-2">1. 収集する情報</h2>
                    <p>当サイトでは、サービス改善のため以下の情報を収集する場合があります：</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>アクセスログ（IPアドレス、ブラウザ情報、参照元URL）</li>
                        <li>クリック情報（クリックしたリンク、ページ遷移）</li>
                        <li>Cookie情報（年齢確認状態の保存など）</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">2. 情報の利用目的</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>サービスの提供・改善</li>
                        <li>アクセス解析・統計情報の作成</li>
                        <li>ランキング機能の提供</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">3. 第三者への提供</h2>
                    <p>法令に基づく場合を除き、収集した個人情報を第三者に提供することはありません。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">4. アフィリエイトプログラム</h2>
                    <p>当サイトは、以下のアフィリエイトプログラムを利用しています：</p>
                    <ul className="list-disc list-inside mt-2">
                        <li>DMM/FANZAアフィリエイト</li>
                    </ul>
                    <p className="mt-2">これらのサービスでは、Cookie等を使用してユーザーの行動を追跡する場合があります。詳細は各サービスのプライバシーポリシーをご確認ください。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">5. Cookieの使用</h2>
                    <p>当サイトでは、年齢確認状態の保存などにCookieを使用しています。ブラウザの設定でCookieを無効にすることができますが、一部機能が制限される場合があります。</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-2">6. お問い合わせ</h2>
                    <p>プライバシーに関するお問い合わせは、<Link href="/legal/contact" className="text-pink-400 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。</p>
                </section>

                <p className="text-sm text-gray-500 mt-8">最終更新日: 2026年2月8日</p>
            </div>
        </div>
    );
}
