"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "better-auth";
import { signOut } from "@/lib/auth-client";
import {
  FolderKanban,
  Key,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  HelpCircle,
  FileText,
} from "lucide-react";

interface DashboardSidebarProps {
  session: Session | null;
  user: {
    name: string | null;
    email: string;
    image: string | null;
    [key: string]: any;
  } | null;
}

export function DashboardSidebar({ session, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Projects",
      href: "/projects",
      icon: FolderKanban,
    },
    {
      label: "API Keys",
      href: "/api-keys",
      icon: Key,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-[#1f1f1f] bg-[#0a0a0a] flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[#1f1f1f] px-4">
        <Link href="/projects" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-white text-xs">
            R
          </div>
          <span className="text-base font-semibold text-white">Renv</span>
        </Link>
      </div>

      {/* User/Team Selector */}
      <div className="border-b border-[#1f1f1f] p-3">
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="text-sm text-[#e5e5e5] truncate">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#666666] group-hover:text-[#999999] flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#888888] hover:text-white hover:bg-[#141414]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[#1f1f1f] p-3 space-y-1">
        <Link
          href="/docs"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888888] hover:text-white hover:bg-[#141414] transition-colors"
        >
          <FileText className="w-4 h-4" />
          Documentation
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888888] hover:text-white hover:bg-[#141414] transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Support
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#888888] hover:text-red-400 hover:bg-[#141414] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
