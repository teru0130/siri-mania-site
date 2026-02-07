'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AgeVerificationContextType {
    isVerified: boolean;
    verify: () => void;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType>({
    isVerified: false,
    verify: () => { },
    showModal: false,
    setShowModal: () => { },
});

export function useAgeVerification() {
    return useContext(AgeVerificationContext);
}

export function AgeVerificationProvider({ children }: { children: ReactNode }) {
    const [isVerified, setIsVerified] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const verified = localStorage.getItem('age_verified') === 'true';
        setIsVerified(verified);
        if (!verified) {
            setShowModal(true);
        }
    }, []);

    const verify = () => {
        localStorage.setItem('age_verified', 'true');
        setIsVerified(true);
        setShowModal(false);
    };

    if (!mounted) {
        return null;
    }

    return (
        <AgeVerificationContext.Provider value={{ isVerified, verify, showModal, setShowModal }}>
            {children}
            {showModal && <AgeVerificationModal onVerify={verify} />}
        </AgeVerificationContext.Provider>
    );
}

function AgeVerificationModal({ onVerify }: { onVerify: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="mx-4 max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center shadow-2xl border border-gray-700">
                <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">年齢確認</h2>
                    <p className="text-gray-300">
                        このサイトは成人向けコンテンツを含みます。
                    </p>
                </div>

                <div className="space-y-3 mb-6 text-left text-sm text-gray-400">
                    <p>• 18歳未満の方のアクセスは固くお断りいたします</p>
                    <p>• 当サイトはアフィリエイト広告を利用しています</p>
                    <p>• 利用規約・プライバシーポリシーに同意の上ご利用ください</p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onVerify}
                        className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3 font-bold text-white transition-all hover:from-pink-600 hover:to-rose-700 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        18歳以上です - 入場する
                    </button>
                    <a
                        href="https://www.google.com"
                        className="w-full rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition-colors hover:bg-gray-700"
                    >
                        18歳未満です - 退出する
                    </a>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    <a href="/legal/terms" className="hover:text-gray-300">利用規約</a>
                    {' | '}
                    <a href="/legal/privacy" className="hover:text-gray-300">プライバシーポリシー</a>
                </div>
            </div>
        </div>
    );
}
