"use client";

import { useState } from "react";

const codeExamples = {
  nodejs: {
    label: "Node.js",
    filename: "app.ts",
    code: `import { Renv } from "@renv/node";

// トークンを渡してインスタンス化
const renv = new Renv(process.env.RENV_TOKEN);

// これだけで環境変数がロードされる
await renv.load();

// process.env に自動注入される
console.log(process.env.DATABASE_URL);
console.log(process.env.API_SECRET);`,
  },
  express: {
    label: "Express",
    filename: "server.ts",
    code: `import express from "express";
import { Renv } from "@renv/node";

const app = express();

// アプリ起動前にロード
const renv = new Renv(process.env.RENV_TOKEN);
await renv.load();

app.listen(process.env.PORT, () => {
  console.log(\`Server running on port \${process.env.PORT}\`);
});`,
  },
  nextjs: {
    label: "Next.js",
    filename: "next.config.ts",
    code: `import { Renv } from "@renv/node";

// ビルド時に環境変数をロード
const renv = new Renv(process.env.RENV_TOKEN);
await renv.load();

const nextConfig = {
  env: {
    // Renv でロードした値を使用
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;`,
  },
};

type CodeTab = keyof typeof codeExamples;

export default function CodeSection() {
  const [activeTab, setActiveTab] = useState<CodeTab>("nodejs");

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#6366f1]/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-[#6366f1] text-sm font-medium mb-3 uppercase tracking-wider">
            シンプルな統合
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            今日の午後に統合
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            シンプルでエレガントなインターフェース。
            数分で環境変数の管理を開始できます。
          </p>
        </div>

        {/* Code Block */}
        <div className="rounded-2xl border border-[#222222] bg-[#0a0a0a] overflow-hidden glow">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-[#222222] bg-[#0a0a0a]">
            {Object.entries(codeExamples).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as CodeTab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === key
                    ? "bg-[#111111] text-white border-t border-l border-r border-[#222222]"
                    : "text-[#71717a] hover:text-[#a1a1aa]"
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>

          {/* Filename bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#111111] border-b border-[#222222]">
            <svg className="w-4 h-4 text-[#6366f1]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.25 2.26l-.08-.04-.01.02C13.46 2.09 12.74 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-4.75-3.31-8.72-7.75-9.74zM19.41 11h-4.07c-.1-2.08-.49-3.97-1.06-5.48 2.77 1.12 4.76 3.68 5.13 5.48zm-8.57-6.72c.64.17 1.76 1.77 2.3 4.72H11c.53-2.95 1.58-4.54 2.16-4.72h-2.32zm-4.56 1.24c-.58 1.51-.96 3.4-1.06 5.48H1.15c.37-1.8 2.36-4.36 5.13-5.48zm-5.13 7.48h4.07c.1 2.08.49 3.97 1.06 5.48-2.77-1.12-4.76-3.68-5.13-5.48zm8.57 6.72c-.64-.17-1.76-1.77-2.3-4.72H13c-.53 2.95-1.58 4.54-2.16 4.72h2.32zm4.56-1.24c.58-1.51.96-3.4 1.06-5.48h4.07c-.37 1.8-2.36 4.36-5.13 5.48z"/>
            </svg>
            <span className="text-sm text-[#a1a1aa]">
              {codeExamples[activeTab].filename}
            </span>
          </div>

          {/* Code Content */}
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm leading-7">
              <code className="text-[#e5e5e5] font-mono">
                {codeExamples[activeTab].code.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-[#4a4a4a] select-none text-right pr-4">
                      {i + 1}
                    </span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(line),
                      }}
                    />
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* Features below code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { icon: "⚡", title: "設定不要", desc: "import して load するだけ" },
            { icon: "🔒", title: "安全", desc: "暗号化して保存・転送" },
            { icon: "🚀", title: "即座に反映", desc: "ダッシュボードで更新" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="text-white font-medium">{item.title}</h4>
                <p className="text-[#71717a] text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Simple syntax highlighting
function highlightCode(line: string): string {
  return line
    .replace(/(import|from|export|default|const|await|new)/g, '<span class="text-[#c792ea]">$1</span>')
    .replace(/("@renv\/node"|"express"|"next\.config\.ts"|"server\.ts"|"app\.ts")/g, '<span class="text-[#c3e88d]">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="text-[#546e7a]">$1</span>')
    .replace(/(process\.env\.\w+)/g, '<span class="text-[#82aaff]">$1</span>')
    .replace(/(console\.log|app\.listen)/g, '<span class="text-[#82aaff]">$1</span>')
    .replace(/(\`[^`]*\`)/g, '<span class="text-[#c3e88d]">$1</span>');
}
