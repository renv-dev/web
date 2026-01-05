import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/helpers/response";

const GET = (req: NextRequest) => withAuth(req, async (_, authCtx) => {
  if (authCtx.type === "session") {
    try {
      const projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              userId: authCtx.session!.userId,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return successResponse(projects, "Projects fetched successfully");
    } catch (error) {
      console.error("Error fetching projects:", error);
      return errorResponse("Failed to fetch projects", 500);
    }
  }

  return errorResponse("Unauthorized", 401);
});

const POST = (req: NextRequest) => withAuth(req, async (req, authCtx) => {
  const payload = await req.json();
  const { name, description } = payload;
  if (authCtx.type == "session") {
    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,

          ownerId: authCtx.session!.userId,
          members: {
            create: {
              userId: authCtx.session!.userId,
              scopes: ["OWNER"]
            }
          },

          branches: {
            create: [
              { name: "main", isMain: true },
              { name: "development" }
            ]
          }
        }
      });

      return successResponse(project, "Project created successfully", 201);
    } catch (error) {
      console.error("Error creating project:", error);
      return errorResponse("Failed to create project", 500);
    }
  }
  return errorResponse("Unauthorized wow", 401);
});

export { GET, POST };