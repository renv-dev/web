import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NewProjectButton } from "@/components/dashboard/new-project-button";

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    return null;
  }

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: session.session.userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          branches: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Projects" />

      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">
              Your Projects
            </h1>
            <p className="text-sm text-[#888888]">
              Manage your environment variables across all your projects
            </p>
          </div>
          <NewProjectButton />
        </div>

        {/* Projects Grid or Empty State */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  name: project.name,
                  description: project.description,
                  createdAt: project.createdAt,
                  updatedAt: project.updatedAt,
                  memberCount: project.members.length,
                  branchCount: project._count.branches,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start managing environment variables securely."
            action={<NewProjectButton size="lg" />}
          />
        )}
      </div>
    </div>
  );
}