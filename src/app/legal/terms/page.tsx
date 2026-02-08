import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '利用規約 - お尻マニア',
    description: 'お尻マニアの利用規約',
};

export default function TermsPage() {
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-700">
                    <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">利用規約</h1>
            </div>

            <div className="prose prose-invert max-w-none">
                <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-2">第1条（適用）</h2>
                        <p>本規約は、当サイト「お尻マニア」（以下「当サイト」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、当サイトをご利用ください。</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-2">第2条（年齢制限）</h2>
                        <p>当サイトは18歳以上の方を対象としています。18歳未満の方のアクセスは固くお断りいたします。</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-2">第3条（禁止事項）</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>当サイトのコンテンツを無断で転載・複製する行為</li>
                            <li>当サイトのサーバーに過度な負荷をかける行為</li>
                            <li>その他、運営者が不適切と判断する行為</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-2">第4条（免責事項）</h2>
                        <p>当サイトで提供する情報の正確性について、運営者は一切の責任を負いません。リンク先のサービス・商品については、各サービス提供者の利用規約に従ってください。</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-2">第5条（アフィリエイトについて）</h2>
                        <p>当サイトはアフィリエイトプログラムを利用しています。リンク先で商品を購入された場合、当サイトに報酬が支払われることがあります。</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-2">第6条（規約の変更）</h2>
                        <p>運営者は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。</p>
                    </section>

                    <p className="text-sm text-gray-500 mt-8">最終更新日: 2026年2月8日</p>
                </div>
            </div>
        </div>
    );
}
