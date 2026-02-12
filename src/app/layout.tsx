import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AgeVerificationProvider } from "@/components/AgeVerification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "お尻マニア - お尻特化おすすめAV作品サイト",
  description: "お尻・ヒップに特化したAV作品のおすすめサイト。独自の視点でスコア評価し、あなたにぴったりの作品を紹介します。",
  metadataBase: new URL('https://siri-mania-site.vercel.app'),
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "rating": "adult",
  },
  openGraph: {
    title: "お尻マニア - お尻特化おすすめAV作品サイト",
    description: "お尻・ヒップに特化したAV作品のおすすめサイト。",
    url: "https://siri-mania-site.vercel.app",
    siteName: "お尻マニア",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "お尻マニア",
    description: "お尻・ヒップに特化したAV作品のおすすめサイト。",
  },
  verification: {
    google: "VFS6SK2NocOKVb76au37MSWd6ZPbQAclh3nBK5BX0wM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "お尻マニア",
    "url": "https://siri-mania-site.vercel.app",
    "description": "お尻・ヒップに特化したAV作品のおすすめサイト。",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://siri-mania-site.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="ja" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AgeVerificationProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AgeVerificationProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}
