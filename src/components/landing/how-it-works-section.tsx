export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "ダッシュボードで環境変数を設定",
      description: "Web ダッシュボードにログインし、プロジェクトを作成。環境変数（Key / Value）を登録します。dev / prod など環境ごとに分けることも可能。",
      visual: (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="space-y-2">
            {["DATABASE_URL", "API_SECRET", "STRIPE_KEY"].map((key, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-[#111111]">
                <span className="text-xs text-[#6366f1] font-mono">{key}</span>
                <span className="text-xs text-[#4a4a4a]">•••••••••</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "アクセストークンを発行",
      description: "プロジェクトごとにアクセストークンを発行。このトークンを使って SDK から環境変数を取得します。トークンは安全に管理されます。",
      visual: (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-4">
          <div className="text-xs text-[#71717a] mb-2">Access Token</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-[#a1a1aa] bg-[#111111] px-3 py-2 rounded font-mono truncate">
              renv_sk_live_xxxxxxxxxxxxxxxx
            </code>
            <button className="p-2 rounded bg-[#111111] hover:bg-[#1a1a1a] text-[#6366f1] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "SDK を import & load",
      description: "Node.js プロジェクトで SDK をインストールし、import して load するだけ。renv.get() で環境変数を取得できます。",
      visual: (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-4 font-mono text-xs">
          <div className="text-[#546e7a]"># インストール</div>
          <div className="text-[#c3e88d] mb-3">npm install @renv/node</div>
          <div className="text-[#546e7a]"># 使用</div>
          <div>
            <span className="text-[#c792ea]">import</span>{" "}
            <span className="text-white">{"{ Renv }"}</span>{" "}
            <span className="text-[#c792ea]">from</span>{" "}
            <span className="text-[#c3e88d]">&quot;@renv/node&quot;</span>
          </div>
          <div className="mt-1">
            <span className="text-[#c792ea]">await</span>{" "}
            <span className="text-[#82aaff]">new Renv</span>
            <span className="text-white">(token).</span>
            <span className="text-[#82aaff]">load</span>
            <span className="text-white">()</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-[#6366f1] text-sm font-medium mb-3 uppercase tracking-wider">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            3ステップで完結
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            複雑な設定は一切不要。シンプルな3ステップで環境変数管理を始められます。
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-bold text-[#222222]">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full">
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
