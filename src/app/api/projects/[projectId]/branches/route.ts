import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from "@/lib/helpers/response";

interface Context {
    params: Promise<{ projectId: string }>;
}

const GET = (req: NextRequest, ctx: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const params = await ctx.params;
    const projectId = params.projectId;

    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");

    if (authCtx.type === "session") {
        const userId = authCtx.session!.userId;

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    members: {
                        where: { projectId: projectId },
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
            where: { id: projectId, ...(name ? { name: name } : {}) },
        });
        return successResponse(project, "Project fetched successfully");
    } catch (error) {
        console.error("Error fetching project:", error);
        return errorResponse("Failed to fetch project", 500);
    }
}, ctx as Context);

const POST = (req: NextRequest, ctx: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const [params, payload] = await Promise.all([ctx.params, req.json()]);
    const projectId = params.projectId;

    if (authCtx.type === "session") {
        const userId = authCtx.session!.userId;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    members: {
                        where: { projectId: projectId },
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

    const { name } = payload;
    try {
        const branch = await prisma.branch.create({
            data: {
                name,
                projectId: projectId,
            },
        });
        return successResponse(branch, "Branch created successfully", 201);
    } catch (error) {
        console.error("Error creating branch:", error);
        return errorResponse("Failed to create branch", 500);
    }
}, ctx as Context);


export { GET, POST };