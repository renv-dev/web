import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/helpers/response";
import { hasScope } from "@/lib/utils/is";

interface Context {
    params: Promise<{
        projectId: string;
        branchId: string;
    }>;
}

// GET: List all environment variables
const GET = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, branchId } = await ctx.params;

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
        const envs = await prisma.env.findMany({
            where: { branchId },
            orderBy: { key: "asc" },
        });
        return successResponse(envs);
    } catch (error) {
        console.error("Error fetching environment variables:", error);
        return errorResponse("Failed to fetch environment variables", 500);
    }
}, context);

// POST: Create a new environment variable
const POST = (req: NextRequest, context: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const [{ projectId, branchId }, body] = await Promise.all([ctx.params, req.json()]);

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

    const { key, value } = body;
    if (!key || typeof key !== "string") {
        return errorResponse("Key is required", 400);
    }

    // Validate key format (uppercase letters, numbers, underscores)
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
        return errorResponse("Key must start with a letter and contain only uppercase letters, numbers, and underscores", 400);
    }

    try {
        const env = await prisma.env.upsert({
            where: { key_branchId: { key, branchId } },
            update: {
                value: value || "",
            },
            create: {
                key,
                value: value || "",
                branchId,
            },
        });
        return successResponse(env, "Created", 201);
    } catch (error) {
        console.error("Error creating environment variable:", error);
        return errorResponse("Failed to create environment variable", 500);
    }
}, context);

export { GET, POST };
