"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0 radial-gradient" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#222222] bg-[#111111]/50 backdrop-blur-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-sm text-[#a1a1aa]">開発者のためのSecrets管理</span>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-in-delay-1 text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white">Stop sharing</span>
          <br />
          <span className="gradient-text">.env files by hand</span>
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in-delay-2 text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
          Renv は、チーム開発における環境変数の共有を
          <span className="text-white font-medium">最小の手間</span>で解決する
          開発者向けSaaSです。
          <br className="hidden md:block" />
          SDK を import するだけで、安全に環境変数を自動注入。
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth"
            className="group px-8 py-4 bg-white text-black rounded-xl text-base font-semibold hover:bg-[#e5e5e5] transition-all hover:scale-105 flex items-center gap-2"
          >
            無料で始める
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/docs"
            className="px-8 py-4 border border-[#333333] text-white rounded-xl text-base font-medium hover:bg-[#111111] hover:border-[#444444] transition-all"
          >
            ドキュメントを見る
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-16 pt-8 border-t border-[#222222]">
          <p className="text-sm text-[#71717a] mb-4">
            小規模チームに選ばれています
          </p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            {/* Placeholder logos */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-20 h-8 rounded bg-[#222222]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-[#71717a]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
