'use client';

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';
import type { WorkMetrics } from '@/types';

interface ScoreCardProps {
    metrics: WorkMetrics;
}

export default function ScoreCard({ metrics }: ScoreCardProps) {
    const data = [
        { subject: 'ヒップフォーカス', value: metrics.hipFocusScore, fullMark: 10 },
        { subject: 'カメラワーク', value: metrics.cameraFocusScore, fullMark: 10 },
        { subject: '衣装・演出', value: metrics.outfitEmphasisScore, fullMark: 10 },
        { subject: 'ダンス・動き', value: metrics.danceFitnessScore, fullMark: 10 },
        { subject: '総合評価', value: metrics.overallPickScore, fullMark: 10 },
    ];

    return (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">スコア詳細</h3>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 10]}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                        />
                        <Radar
                            name="スコア"
                            dataKey="value"
                            stroke="#EC4899"
                            fill="#EC4899"
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Score Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                {data.map((item) => (
                    <div key={item.subject} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.subject}</span>
                        <span className="font-semibold text-white">
                            {item.value.toFixed(1)}
                            <span className="text-gray-500 text-xs">/10</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
