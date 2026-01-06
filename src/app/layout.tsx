import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactLayoutProps } from "@/types/react";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const titles = [
  "Renv — 激安・超簡単 Secrets 管理 SaaS | 小規模チーム向け API キー・環境変数管理",
  "Renv — Low-Cost & Easy Secrets Management SaaS | API Key & Env Var Management for Small Teams",
];
const descriptions = [
  "Renv は 2〜10人規模のチーム向けに設計された、低価格で簡単に導入できる Secrets 管理サービスです。Web ダッシュボードと Node.js SDK により、API キー・トークン・環境変数を安全に暗号化保存し、import するだけで自動注入します。",
  "最小コストで導入できる Secrets 管理。SDK を import するだけで環境変数が自動設定され、git や Slack に貼るリスクを削減します。",
  "Web ダッシュボード＋Node.js SDKで、APIキー・環境変数管理を最小手間に。小規模チーム向けの低価格SaaS。",
];
const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: titles[0],
    template: "%s | Renv",
  },
  description: descriptions[0],
  keywords: [
    "Secrets 管理",
    "環境変数",
    "API キー",
    "Node.js",
    "Next.js",
    "小規模チーム",
    "SaaS",
    "セキュリティ",
    "秘密鍵管理",
  ],
  metadataBase: new URL(url),
  alternates: {
    canonical: url,
  },
  authors: [{ name: "Renv", url }],
  openGraph: {
    title: titles[1],
    description: descriptions[1],
    url: url,
    siteName: "Renv",
    images: [
      {
        url: `${url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Renv - Secrets 管理",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: titles[1],
    description: descriptions[2],
    images: [
      `${url}/og-image.png`,
    ],
    site: "@renv",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: ReactLayoutProps) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0a0a0a",
              border: "1px solid #1f1f1f",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
