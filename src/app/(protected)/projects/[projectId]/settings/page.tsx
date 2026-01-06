import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProjectPageProps } from "../page";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectSettingsForm } from "@/components/dashboard/project-settings-form";

export default async function ProjectSettingsPage({ params }: ProjectPageProps) {
    const [{ projectId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);
    if (!session?.session) {
        return null;
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            members: {
                some: {
                    userId: session.session.userId,
                },
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            },
            tokens: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!project) {
        return notFound();
    }

    const currentMember = project.members.find(
        (m) => m.userId === session.session.userId
    );

    return (
        <ProjectSettingsForm
            project={{
                id: project.id,
                name: project.name,
                description: project.description,
                ownerId: project.ownerId,
                createdAt: project.createdAt,
            }}
            members={project.members}
            tokens={project.tokens}
            currentUserScopes={currentMember?.scopes || []}
            currentUserId={session.session.userId}
        />
    );
}