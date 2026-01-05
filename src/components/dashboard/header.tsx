"use client";

import { Search, Bell } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-sm px-6">
      {/* Left: Title or Breadcrumb */}
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-sm font-medium text-white">{title}</h1>
        )}
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] h-8 pl-9 pr-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#333333] transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#666666] bg-[#1f1f1f] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors">
          <Bell className="w-4 h-4 text-[#888888]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6366f1] rounded-full" />
        </button>
      </div>
    </header>
  );
}
