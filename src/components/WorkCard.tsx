'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Calendar, ExternalLink } from 'lucide-react';
import type { Work } from '@/types';

interface WorkCardProps {
    work: Work;
    showRank?: number;
    size?: 'small' | 'medium' | 'large';
}

export default function WorkCard({ work, showRank, size = 'medium' }: WorkCardProps) {
    const handleClick = async () => {
        // クリックイベントを記録
        try {
            await fetch('/api/clicks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageType: 'work_card',
                    pageId: work.id,
                    linkType: 'affiliate',
                    destination: work.affiliateUrl,
                    workId: work.id,
                }),
            });
        } catch (error) {
            console.error('Failed to record click:', error);
        }
    };

    const overallScore = work.metrics?.overallPickScore ?? 0;

    return (
        <div className={`group relative rounded-xl glass-card overflow-hidden card-hover ${size === 'large' ? 'col-span-2 row-span-2' : ''
            }`}>
            {/* Rank Badge */}
            {showRank && (
                <div className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full score-badge font-bold text-black text-sm">
                    {showRank}
                </div>
            )}

            {/* Thumbnail */}
            <Link href={`/works/${work.id}`} className="block aspect-[3/4] relative overflow-hidden img-overlay">
                {work.thumbnailUrl ? (
                    <Image
                        src={work.thumbnailUrl}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes={size === 'large' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-gray-500 text-4xl group-hover:scale-110 transition-transform duration-300">🍑</span>
                    </div>
                )}

                {/* Score Overlay */}
                {overallScore > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1.5 backdrop-blur-md border border-white/10 z-10">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-white">{overallScore.toFixed(1)}</span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4">
                <Link href={`/works/${work.id}`}>
                    <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-pink-400 transition-colors duration-300">
                        {work.title}
                    </h3>
                </Link>

                {/* Tags */}
                {work.tags && work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {work.tags.slice(0, 3).map((wt) => (
                            <Link
                                key={wt.tagId}
                                href={`/tags/${wt.tag.slug}`}
                                className="tag-pill text-xs px-2.5 py-1 rounded-full bg-gray-700/50 border border-gray-600/50 text-gray-300"
                            >
                                {wt.tag.name}
                            </Link>
                        ))}
                        {work.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 text-gray-500">+{work.tags.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {work.durationMinutes && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {work.durationMinutes}分
                        </span>
                    )}
                    {work.releaseDate && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(work.releaseDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })}
                        </span>
                    )}
                </div>

                {/* CTA Button */}
                <a
                    href={work.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className="btn-glow flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <span>詳細を見る</span>
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}
