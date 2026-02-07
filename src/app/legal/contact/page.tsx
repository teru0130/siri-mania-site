import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'お問い合わせ - 尻マニア',
    description: '尻マニアへのお問い合わせ',
};

export default function ContactPage() {
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Mail className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">お問い合わせ</h1>
            </div>

            <div className="rounded-xl bg-gray-800 border border-gray-700 p-6 space-y-6 text-gray-300">
                <p>当サイトへのお問い合わせは、下記メールアドレスまでご連絡ください。</p>

                <div className="rounded-lg bg-gray-700 p-4">
                    <p className="text-sm text-gray-400 mb-1">メールアドレス</p>
                    <p className="text-white font-mono">contact@example.com</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-white">お問い合わせの際のお願い</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>件名に「尻マニアについて」と明記してください</li>
                        <li>返信まで数日かかる場合があります</li>
                        <li>内容によっては返信できない場合があります</li>
                    </ul>
                </div>

                <div className="rounded-lg bg-rose-900/20 border border-rose-800 p-4 text-sm">
                    <p className="text-rose-300">
                        ※ 個別の作品に関するお問い合わせ（在庫状況、価格、配信内容等）は、
                        各配信サービス（DMM/FANZA等）に直接お問い合わせください。
                    </p>
                </div>
            </div>
        </div>
    );
}
