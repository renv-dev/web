import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 radial-gradient opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Secrets管理を再定義。
            <br />
            <span className="gradient-text">今日から利用可能。</span>
          </h2>

          {/* Subheading */}
          <p className="text-lg text-[#a1a1aa] mb-10 max-w-2xl mx-auto">
            数分で環境変数の管理を開始できます。
            <br />
            クレジットカード不要で今すぐお試しください。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth"
              className="group px-8 py-4 bg-white text-black rounded-xl text-base font-semibold hover:bg-[#e5e5e5] transition-all hover:scale-105 flex items-center gap-2"
            >
              今すぐ始める
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
              href="/contact"
              className="px-8 py-4 border border-[#333333] text-white rounded-xl text-base font-medium hover:bg-[#111111] hover:border-[#444444] transition-all"
            >
              お問い合わせ
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#71717a]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              クレジットカード不要
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              セットアップ 5分
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              いつでもキャンセル可能
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
