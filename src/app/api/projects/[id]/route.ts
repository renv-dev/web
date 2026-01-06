import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from "@/lib/helpers/response";

type BooleanString = "true" | "false";
interface Context {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ member?: BooleanString, branch?: BooleanString }>;
}

const GET = (req: NextRequest, context: Context) => withAuth(req, async (session, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const [params, searchParams] = await Promise.all([ctx.params, ctx.searchParams]);
    const projectId = params.id;

    if (authCtx.type === "session") {
        const userId = authCtx.session!.userId;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    members: {
                        where: { projectId: (await ctx.params).id },
                    },
                },
            });
            if (!user) return unauthorizedResponse();
            const member = user.members[0];
            if (!member) return forbiddenResponse("You are not a member of this project");
            const hasReadProjectScope = member.scopes.includes("READ_PROJECT") || member.scopes.includes("OWNER");
            if (!hasReadProjectScope) return forbiddenResponse("You do not have permission to view this project");
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("API token does not have access to this project");
        const hasReadProjectScope = token.scopes.includes("READ_PROJECT") || token.scopes.includes("OWNER");
        if (!hasReadProjectScope) return forbiddenResponse("API token does not have permission to view this project");
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: searchParams.member === "true" ? true : false,
                branches: searchParams.branch === "true" ? true : false,
            }
        });
        return successResponse(project, "Project fetched successfully");
    } catch (error) {
        console.error("Error fetching project:", error);
        return errorResponse("Failed to fetch project", 500);
    }
}, context as Context);

const PUT = (req: NextRequest, context: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const params = await ctx.params;
    const projectId = params.id;
    const payload = await req.json();
    const { name, description } = payload;

    if (authCtx.type === "session") {
        const userId = authCtx.session!.userId;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    members: {
                        where: { projectId },
                    },
                },
            });
            if (!user) return unauthorizedResponse();
            const member = user.members[0];
            if (!member) return forbiddenResponse("You are not a member of this project");
            const hasWriteProjectScope = member.scopes.includes("WRITE_PROJECT") || member.scopes.includes("OWNER");
            if (!hasWriteProjectScope) return forbiddenResponse("You do not have permission to modify this project");
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("API token does not have access to this project");
        const hasWriteProjectScope = token.scopes.includes("WRITE_PROJECT") || token.scopes.includes("OWNER");
        if (!hasWriteProjectScope) return forbiddenResponse("API token does not have permission to modify this project");
    }

    try {
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                name,
                description,
            },
        });
        return successResponse(updatedProject, "Project updated successfully");
    } catch (error) {
        console.error("Error updating project:", error);
        return errorResponse("Failed to update project", 500);
    }
}, context as Context);

const DELETE = (req: NextRequest, context: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const params = await ctx.params;
    const projectId = params.id;

    if (authCtx.type === "session") {
        const userId = authCtx.session!.userId;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    members: {
                        where: { projectId },
                    },
                },
            });
            if (!user) return unauthorizedResponse();
            const member = user.members[0];
            if (!member) return forbiddenResponse("You are not a member of this project");
            const isOwner = member.scopes.includes("OWNER");
            if (!isOwner) return forbiddenResponse("Only project owners can delete the project");
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("API token does not have access to this project");
        const isOwner = token.scopes.includes("OWNER");
        if (!isOwner) return forbiddenResponse("API token does not have permission to delete this project");
    }

    try {
        await prisma.project.delete({
            where: { id: projectId },
        });
        return successResponse(null, "Project deleted successfully");
    } catch (error) {
        console.error("Error deleting project:", error);
        return errorResponse("Failed to delete project", 500);
    }
}, context as Context);

export { GET, PUT, DELETE };