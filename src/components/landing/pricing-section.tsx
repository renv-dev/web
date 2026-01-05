"use client";

import { useState } from "react";
import Link from "next/link";

type PlanKey = "free" | "team" | "unlimited";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const plans: Record<PlanKey, Plan> = {
  free: {
    name: "Free",
    price: "$0",
    period: "/ forever",
    description: "個人・検証用に最適",
    features: [
      "プロジェクト 1つ",
      "環境 1つ",
      "Secrets 10個まで",
      "メンバー 1人",
      "Node.js SDK",
    ],
    cta: "無料で始める",
  },
  team: {
    name: "Team",
    price: "$2",
    period: "/ 月",
    description: "小規模チームにおすすめ",
    features: [
      "プロジェクト 3つ",
      "dev / prod 環境",
      "Secrets 100個まで",
      "メンバー 5人まで",
      "Node.js SDK",
      "優先サポート",
    ],
    cta: "チームプランを始める",
    popular: true,
  },
  unlimited: {
    name: "Unlimited",
    price: "$5",
    period: "/ 月",
    description: "制限なしで使い放題",
    features: [
      "プロジェクト 無制限",
      "環境 無制限",
      "Secrets 無制限",
      "メンバー 無制限",
      "Node.js SDK",
      "優先サポート",
      "カスタム統合",
    ],
    cta: "アンリミテッドを始める",
  },
};

export default function PricingSection() {
  const [hoveredPlan, setHoveredPlan] = useState<PlanKey | null>(null);

  return (
    <section id="pricing" className="py-32 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-[#6366f1] text-sm font-medium mb-3 uppercase tracking-wider">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            シンプルで透明な料金
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            隠れたコストは一切なし。必要な分だけお支払いください。
            <br />
            <span className="text-white">クレジットカード不要</span>で無料プランから始められます。
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(Object.entries(plans) as [PlanKey, Plan][]).map(([key, plan]) => (
            <div
              key={key}
              onMouseEnter={() => setHoveredPlan(key)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                plan.popular
                  ? "border-[#6366f1] bg-[#111111]"
                  : "border-[#222222] bg-[#0a0a0a] hover:border-[#333333]"
              } ${
                hoveredPlan === key ? "scale-[1.02]" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-medium rounded-full">
                    おすすめ
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-[#71717a] text-sm">{plan.period}</span>
                </div>
                <p className="text-[#a1a1aa] text-sm mt-2">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-[#22c55e] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[#a1a1aa]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href="/auth"
                className={`block w-full py-3 rounded-xl text-center font-medium transition-all ${
                  plan.popular
                    ? "bg-white text-black hover:bg-[#e5e5e5]"
                    : "bg-[#111111] text-white border border-[#333333] hover:bg-[#1a1a1a]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <div className="mt-12 text-center">
          <p className="text-[#71717a] text-sm">
            すべてのプランに含まれる：暗号化保存、Node.js SDK、Webダッシュボード
          </p>
        </div>
      </div>
    </section>
  );
}
