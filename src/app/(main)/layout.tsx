import { ReactLayoutProps } from "@/types/react";
import Header from "@/components/layout/headers";
import Footer from "@/components/layout/footer";

export default function LPLayout({ children }: ReactLayoutProps) {
    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}