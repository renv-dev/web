import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    product: {
      title: "プロダクト",
      links: [
        { name: "機能", href: "#features" },
        { name: "料金", href: "#pricing" },
        { name: "ドキュメント", href: "/docs" },
        { name: "変更履歴", href: "/changelog" },
      ],
    },
    company: {
      title: "会社",
      links: [
        { name: "ブログ", href: "/blog" },
        { name: "お問い合わせ", href: "/contact" },
        { name: "採用情報", href: "/careers" },
      ],
    },
    legal: {
      title: "法務",
      links: [
        { name: "利用規約", href: "/terms" },
        { name: "プライバシー", href: "/privacy" },
        { name: "セキュリティ", href: "/security" },
      ],
    },
  };

  return (
    <footer className="border-t border-[#222222] bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-white text-sm">
                R
              </div>
              <span className="text-xl font-semibold text-white">Renv</span>
            </Link>
            <p className="text-sm text-[#71717a] leading-relaxed">
              チーム開発における環境変数管理を
              最小の手間で解決する開発者向けSaaS
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#71717a] hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#222222] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#71717a]">
            © {new Date().getFullYear()} Renv. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/renv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717a] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/renv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717a] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
