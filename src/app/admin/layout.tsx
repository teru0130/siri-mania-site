'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, TrendingUp, BarChart3, LogOut, Home } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const links = [
        { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard },
        { href: '/admin/works', label: '作品管理', icon: Package },
        { href: '/admin/tags', label: 'タグ管理', icon: Tag },
        { href: '/admin/rankings', label: 'ランキング', icon: TrendingUp },
        { href: '/admin/analytics', label: 'アナリティクス', icon: BarChart3 },
    ];

    if (!session) {
        return null;
    }

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                        <span className="text-xl font-bold text-white">H</span>
                    </div>
                    <span className="font-bold text-lg text-white">Admin</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-pink-500/20 text-pink-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <Home className="h-5 w-5" />
                    サイトを表示
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    ログアウト
                </button>
            </div>
        </aside>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
    );
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <AdminSidebar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
