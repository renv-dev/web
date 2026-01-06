import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
    GitBranch,
    ChevronRight,
    Plus,
    ArrowLeft,
    Calendar,
    Star,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectPageProps } from "../page";
import Link from "next/link";


export default async function ProjectBranchesPage({ params }: ProjectPageProps) {
    const [{ projectId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);
    if (!session?.session) {
        return null;
    }

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            members: {
                some: {
                    userId: session.session.userId,
                },
            },
        },
        include: {
            branches: {
                orderBy: {
                    name: "asc",
                },
                include: {
                    _count: {
                        select: {
                            envs: true,
                        },
                    },
                },
            },
            members: {
                where: {
                    userId: session.session.userId,
                },
            },
        },
    });
    if (!project) {
        return redirect("/projects");
    }

    const currentMember = project.members[0];
    const canManageBranches =
        currentMember?.scopes.includes("OWNER") ||
        currentMember?.scopes.includes("WEITE_BRANCH");

    // メインブランチを先頭に並べ替え
    const sortedBranches = [...project.branches].sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="min-h-screen">
            <DashboardHeader title={`${project.name} / Branches`} />

            <div className="p-6 lg:p-8">
                {/* Back Link */}
                <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Project
                </Link>

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-white mb-1">
                            Branches
                        </h1>
                        <p className="text-sm text-[#888888]">
                            Manage environment variables for each branch
                        </p>
                    </div>
                    {canManageBranches && (
                        <button className="flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            New Branch
                        </button>
                    )}
                </div>

                {/* Branches List */}
                {sortedBranches.length > 0 ? (
                    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden">
                        <div className="divide-y divide-[#1f1f1f]">
                            {sortedBranches.map((branch) => (
                                <Link
                                    key={branch.id}
                                    href={`/projects/${project.id}/branches/${branch.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-[#0f0f0f] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1f1f1f] flex items-center justify-center">
                                            <GitBranch className="w-5 h-5 text-[#6366f1]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">
                                                    {branch.name}
                                                </span>
                                                {branch.isMain && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded text-xs text-[#6366f1]">
                                                        <Star className="w-3 h-3" />
                                                        Main
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-[#666666]">
                                                    {branch._count.envs} environment variable{branch._count.envs !== 1 ? "s" : ""}
                                                </span>
                                                <span className="text-xs text-[#444444]">•</span>
                                                <span className="flex items-center gap-1 text-xs text-[#666666]">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(branch.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[#444444] group-hover:text-[#888888] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-12 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
                            <GitBranch className="w-6 h-6 text-[#666666]" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                            No branches yet
                        </h3>
                        <p className="text-sm text-[#888888] mb-6 max-w-sm mx-auto">
                            Create your first branch to start managing environment variables.
                        </p>
                        {canManageBranches && (
                            <button className="inline-flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors">
                                <Plus className="w-4 h-4" />
                                Create Branch
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}