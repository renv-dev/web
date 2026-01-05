import { headers } from "next/headers";
import { ReactLayoutProps } from "@/types/react";
import { auth } from "@/lib/auth";
import React from "react";

export default async function ProtectedLayout({ children }: ReactLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        return (
            <html lang="ja">
                <body>
                    <div className="flex items-center justify-center h-screen">
                        <p className="text-gray-500">ログインが必要です。</p>
                    </div>
                </body>
            </html>
        );
    }

    return (
        <main>
            {children}
        </main>
    )
};