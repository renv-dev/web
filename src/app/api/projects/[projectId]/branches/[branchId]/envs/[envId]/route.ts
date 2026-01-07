import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/helpers/response";
import { hasScope } from "@/lib/utils/is";

interface Context {
    params: Promise<{
        projectId: string;
        branchId: string;
        envId: string;
    }>;
}

// GET: Get a single environment variable
const GET = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, branchId, envId } = await ctx.params;

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
            const canRead = hasScope(member.scopes, ["OWNER", "READ_ENV"]);
            if (!canRead) return forbiddenResponse("You do not have permission to read environment variables");
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("API token does not have access to this project");
        const canRead = hasScope(token.scopes, ["OWNER", "READ_ENV"]);
        if (!canRead) return forbiddenResponse("API token does not have permission to read environment variables");
    }

    try {
        const env = await prisma.env.findFirst({
            where: { id: envId, branchId },
        });

        if (!env) {
            return errorResponse("Environment variable not found", 404);
        }

        return successResponse(env);
    } catch (error) {
        console.error("Error fetching environment variable:", error);
        return errorResponse("Failed to fetch environment variable", 500);
    }
}, context);

// PATCH: Update an environment variable
const PATCH = (req: NextRequest, context: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, branchId, envId } = await ctx.params;

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
            const canWrite = hasScope(member.scopes, ["OWNER", "WRITE_ENV"]);
            if (!canWrite) return forbiddenResponse("You do not have permission to write environment variables");
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("API token does not have access to this project");
        const canWrite = hasScope(token.scopes, ["OWNER", "WRITE_ENV"]);
        if (!canWrite) return forbiddenResponse("API token does not have permission to write environment variables");
    }

    // Verify env exists and belongs to the branch
    const existingEnv = await prisma.env.findFirst({
        where: { id: envId, branchId },
    });

    if (!existingEnv) {
        return errorResponse("Environment variable not found", 404);
    }

    const body = await req.json();
    const { key, value } = body;

    // If key is being changed, validate and check for duplicates
    if (key && key !== existingEnv.key) {
        if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
            return errorResponse("Key must start with a letter and contain only uppercase letters, numbers, and underscores", 400);
        }

        const duplicateEnv = await prisma.env.findFirst({
            where: { branchId, key, NOT: { id: envId } },
        });

        if (duplicateEnv) {
            return errorResponse("Environment variable with this key already exists", 409);
        }
    }

    try {
        const env = await prisma.env.update({
            where: { id: envId },
            data: {
                ...(key && { key }),
                ...(value !== undefined && { value }),
            },
        });

        return successResponse(env);
    } catch (error) {
        console.error("Error updating environment variable:", error);
        return errorResponse("Failed to update environment variable", 500);
    }
}, context);

// DELETE: Delete an environment variable
const DELETE = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, branchId, envId } = await ctx.params;

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
            const canDelete = hasScope(member.scopes, ["OWNER", "DELETE_ENV"]);
            if (!canDelete) return forbiddenResponse("You do not have permission to delete environment variables");
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("API token does not have access to this project");
        const canDelete = hasScope(token.scopes, ["OWNER", "DELETE_ENV"]);
        if (!canDelete) return forbiddenResponse("API token does not have permission to delete environment variables");
    }

    // Verify env exists and belongs to the branch
    const existingEnv = await prisma.env.findFirst({
        where: { id: envId, branchId },
    });

    if (!existingEnv) {
        return errorResponse("Environment variable not found", 404);
    }

    try {
        await prisma.env.delete({
            where: { id: envId },
        });

        return successResponse({ message: "Environment variable deleted" });
    } catch (error) {
        console.error("Error deleting environment variable:", error);
        return errorResponse("Failed to delete environment variable", 500);
    }
}, context);

export { GET, PATCH, DELETE };
