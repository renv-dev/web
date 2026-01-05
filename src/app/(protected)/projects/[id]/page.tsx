import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectOverview } from "@/components/dashboard/project-overview";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    return null;
  }

  // Find project with membership check
  const project = await prisma.project.findFirst({
    where: {
      id,
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
      branches: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get the current user's role in this project
  const currentMember = project.members.find(
    (m) => m.userId === session.session.userId
  );

  return (
    <div className="min-h-screen">
      <DashboardHeader title={project.name} />

      <div className="p-6 lg:p-8">
        <ProjectOverview
          project={{
            id: project.id,
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          }}
          branches={project.branches}
          members={project.members.map((m) => ({
            ...m.user,
            scopes: m.scopes,
          }))}
          currentUserScopes={currentMember?.scopes || []}
        />
      </div>
    </div>
  );
}
