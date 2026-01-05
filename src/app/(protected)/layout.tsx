import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ReactLayoutProps } from "@/types/react";
import { auth } from "@/lib/auth";

export default async function ProtectedLayout({ children }: ReactLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session.user) {
    return redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <DashboardSidebar
        session={session.session}
        user={{
          ...session.user,
          image: session.user.image ?? null,
        }}
      />

      {/* Main Content Area */}
      <main className="pl-[240px]">
        {children}
      </main>
    </div>
  );
}