import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    GitBranch,
    Star,
    Calendar,
    Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { EnvDashboard } from "@/components/dashboard/env-dashboard";
import Link from "next/link";


interface BranchPageProps {
    params: Promise<{
        projectId: string;
        branchId: string;
    }>;
}

export default async function BranchPage({ params }: BranchPageProps) {
    const [{ projectId, branchId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);
    if (!session?.session) {
        return null;
    }

    const branch = await prisma.branch.findFirst({
        where: {
            id: branchId,
            project: {
                id: projectId,
                members: {
                    some: {
                        userId: session.session.userId,
                    },
                },
            },
        },
        include: {
            envs: {
                orderBy: { key: "asc" },
            },
            project: {
                include: {
                    members: {
                        where: {
                            userId: session.session.userId,
                        },
                    },
                },
            },
        },
    });

    if (!branch) {
        return notFound();
    }

    const currentMember = branch.project.members[0];
    const scopes = currentMember?.scopes || [];

    const canRead = scopes.includes("OWNER") || scopes.includes("READ_ENV");
    const canWrite = scopes.includes("OWNER") || scopes.includes("WRITE_ENV");
    const canDelete = scopes.includes("OWNER") || scopes.includes("DELETE_ENV");

    return (
        <div className="min-h-screen">
            <DashboardHeader title={`${branch.project.name} / ${branch.name}`} />

            <div className="p-6 lg:p-8">
                {/* Back Link */}
                <Link
                    href={`/projects/${projectId}/branches`}
                    className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Branches
                </Link>

                {/* Branch Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1f1f1f] flex items-center justify-center">
                            <GitBranch className="w-5 h-5 text-[#6366f1]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold text-white">
                                    {branch.name}
                                </h1>
                                {branch.isMain && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded text-xs text-[#6366f1]">
                                        <Star className="w-3 h-3" />
                                        Main
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-[#888888]">
                                Manage environment variables for this branch
                            </p>
                        </div>
                    </div>

                    {/* Branch Stats */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-xs text-[#666666]">
                            <Calendar className="w-3.5 h-3.5" />
                            Created {new Date(branch.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#666666]">
                            <Clock className="w-3.5 h-3.5" />
                            Updated {new Date(branch.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {/* Environment Variables Dashboard */}
                <EnvDashboard
                    branchId={branchId}
                    projectId={projectId}
                    envs={branch.envs}
                    canRead={canRead}
                    canWrite={canWrite}
                    canDelete={canDelete}
                />
            </div>
        </div>
    );
}