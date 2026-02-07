'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, TrendingUp, Tag, Home, BookOpen, Shield } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'ホーム', icon: Home },
        { href: '/ranking/weekly', label: 'ランキング', icon: TrendingUp },
        { href: '/tags', label: 'タグ', icon: Tag },
        { href: '/guide', label: 'ガイド', icon: BookOpen },
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-800/50 glass-header">
            <div className="container mx-auto flex h-16 items-center px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mr-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
                        <span className="text-xl">🍑</span>
                    </div>
                    <span className="hidden font-bold text-xl bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent sm:inline-block">
                        尻マニア
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 flex-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Search (Desktop) */}
                <div className="hidden md:flex items-center gap-4 ml-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            placeholder="作品を検索..."
                            className="w-64 rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden ml-auto p-2 text-gray-300 hover:text-white"
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-800 bg-gray-900">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 mt-2 border-t border-gray-800">
                            <input
                                type="search"
                                placeholder="作品を検索..."
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 px-4 text-sm text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
