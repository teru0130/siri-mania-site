import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AgeVerificationProvider } from "@/components/AgeVerification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "お尻マニア - お尻特化おすすめAV作品サイト",
  description: "お尻・ヒップに特化したAV作品のおすすめサイト。",
  robots: {
    index: false, // R18サイトのため検索エンジンにインデックスさせない設定
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}>
        <AgeVerificationProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AgeVerificationProvider>
      </body>
    </html>
  );
}
