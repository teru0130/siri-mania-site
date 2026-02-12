'use client';

import { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RankingRecalculateButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const router = useRouter();

    const handleRecalculate = async () => {
        setIsLoading(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/admin/rankings/recalculate', {
                method: 'POST',
            });

            if (!res.ok) {
                throw new Error('Failed to recalculate');
            }

            setStatus('success');
            router.refresh();

            // 3秒後にステータスをリセット
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRecalculate}
            disabled={isLoading}
            className={`
                flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all
                ${status === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    status === 'error' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'}
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
        >
            {isLoading ? (
                <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    計算中...
                </>
            ) : status === 'success' ? (
                <>
                    <Check className="h-4 w-4" />
                    完了
                </>
            ) : status === 'error' ? (
                <>
                    <AlertCircle className="h-4 w-4" />
                    エラー
                </>
            ) : (
                <>
                    <RefreshCw className="h-4 w-4" />
                    再計算実行
                </>
            )}
        </button>
    );
}
