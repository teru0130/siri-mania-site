'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

interface SampleVideoCardProps {
    video: {
        id: string;
        title: string;
        embedCode: string;
        description: string | null;
        thumbnailUrl: string | null;
        createdAt: Date;
    };
}

export default function SampleVideoCard({ video }: SampleVideoCardProps) {
    const [showEmbed, setShowEmbed] = useState(!video.thumbnailUrl);

    return (
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col h-full hover:border-gray-700 transition-colors">
            {/* Video Area */}
            <div className="aspect-video bg-black relative group">
                {showEmbed ? (
                    <div
                        className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
                        dangerouslySetInnerHTML={{ __html: video.embedCode }}
                    />
                ) : (
                    <button
                        onClick={() => setShowEmbed(true)}
                        className="w-full h-full relative block cursor-pointer"
                        aria-label={`動画「${video.title}」を再生`}
                    >
                        {/* Thumbnail Image */}
                        {video.thumbnailUrl && (
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        )}

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <div className="h-16 w-16 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="h-8 w-8 text-white ml-1" />
                            </div>
                        </div>
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {video.title}
                </h3>
                {video.description && (
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                        {video.description}
                    </p>
                )}
                <div className="mt-auto text-xs text-gray-500">
                    {new Date(video.createdAt).toLocaleDateString('ja-JP')}
                </div>
            </div>
        </div>
    );
}
