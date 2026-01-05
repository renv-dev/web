"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Placeholder for auth state

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const checkAuth = async () => {
      const session = await authClient.getSession();
      setIsLoggedIn(!!session.data);
    }
    window.addEventListener("scroll", handleScroll);
    checkAuth();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#000000]/80 backdrop-blur-lg border-b border-[#222222]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-white text-sm">
            R
          </div>
          <span className="text-xl font-semibold text-white group-hover:text-[#a1a1aa] transition-colors">
            Renv
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-[#a1a1aa] hover:text-white transition-colors text-sm"
          >
            機能
          </Link>
          <Link
            href="#pricing"
            className="text-[#a1a1aa] hover:text-white transition-colors text-sm"
          >
            料金
          </Link>
          <Link
            href="#how-it-works"
            className="text-[#a1a1aa] hover:text-white transition-colors text-sm"
          >
            使い方
          </Link>
          <Link
            href="/docs"
            className="text-[#a1a1aa] hover:text-white transition-colors text-sm"
          >
            ドキュメント
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={isLoggedIn ? "/projects" : "/auth"}
            className="text-[#a1a1aa] hover:text-white transition-colors text-sm hidden sm:block">
            ログイン
          </Link>
          <Link
            href={isLoggedIn ? "/projects" : "/auth"}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e5e5e5] transition-colors">
            無料で始める
          </Link>
        </div>
      </nav>
    </header>
  );
}
