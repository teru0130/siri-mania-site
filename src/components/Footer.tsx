import Link from 'next/link';
import { Mail, Shield, FileText, HelpCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const legalLinks = [
        { href: '/legal/terms', label: '利用規約', icon: FileText },
        { href: '/legal/privacy', label: 'プライバシーポリシー', icon: Shield },
        { href: '/legal/disclaimer', label: '免責事項', icon: HelpCircle },
        { href: '/legal/contact', label: 'お問い合わせ', icon: Mail },
    ];

    return (
        <footer className="border-t border-gray-800 bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                                <span className="text-lg">🍑</span>
                            </div>
                            <span className="font-bold text-lg text-white">お尻マニア</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            お尻・ヒップに特化したAV作品の比較サイト。
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">法的情報</h3>
                        <ul className="space-y-2">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Affiliate Notice */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">アフィリエイトについて</h3>
                        <div className="rounded-lg bg-gray-800 p-4 text-sm text-gray-400">
                            <p className="flex items-start gap-2">
                                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    当サイトはアフィリエイトプログラムを利用しています。
                                    リンク先で商品を購入された場合、当サイトに報酬が支払われることがあります。
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} お尻マニア. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-rose-900/50 text-rose-300 border border-rose-800">
                            18歳以上限定
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
