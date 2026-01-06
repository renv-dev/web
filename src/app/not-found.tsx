"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    const handleBackbutton = () => {
        router.back();
    }
    return (
        <div className="flex flex-col items-center justify-center h-full py-20">
            <h1 className="text-3xl font-bold mb-4">404 - Not Found</h1>
            <p className="text-lg text-[#888888]">The requested resource could not be found.</p>

            <button
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleBackbutton}
            >
                Back to Previous Page
            </button>
        </div>
    )
}