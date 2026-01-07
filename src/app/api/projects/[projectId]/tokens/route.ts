import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/helpers/response";
import { hasScope } from "@/lib/utils/is";
import crypto from "crypto";

interface Context {
    params: Promise<{
        projectId: string;
    }>;
}

// GET: List all tokens
const GET = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId } = await ctx.params;

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
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        return forbiddenResponse("Cannot list tokens with an API token");
    }

    try {
        const tokens = await prisma.token.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
        });
        return successResponse(tokens);
    } catch (error) {
        console.error("Error fetching tokens:", error);
        return errorResponse("Failed to fetch tokens", 500);
    }
}, context);

// POST: Create a new token
const POST = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const [{ projectId }, payload] = await Promise.all([ctx.params, req.json()]);

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
            if (!hasScope(member.scopes, ["OWNER"])) return forbiddenResponse("You do not have permission to create tokens for this project");

            // Validate and use provided scopes, default to READ_ENV
            const validScopes = ["READ_ENV", "WRITE_ENV", "DELETE_ENV", "READ_PROJECT", "READ_BRANCH"] as const;
            type TokenScope = typeof validScopes[number];
            const requestedScopes = payload.scopes as string[] | undefined;
            let tokenScopes: TokenScope[] = requestedScopes?.filter((s): s is TokenScope => validScopes.includes(s as TokenScope)) || ["READ_ENV"];
            
            if (tokenScopes.length === 0) {
                tokenScopes = ["READ_ENV"];
            }

            // Generate a secure token
            const tokenValue = `renv_${crypto.randomBytes(32).toString("hex")}`;

            // Set expiration to 1 year from now
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            const token = await prisma.token.create({
                data: {
                    token: tokenValue,
                    userId,
                    projectId,
                    expiresAt,
                    scopes: tokenScopes,
                },
            });

            return successResponse(token, "Token created successfully", 201);
        } catch (error) {
            console.error("Error creating token:", error);
            return errorResponse("Failed to create token", 500);
        }
    } else if (authCtx.type === "token") {
        return forbiddenResponse("Cannot create tokens with an API token");
    }

    return errorResponse("Invalid authentication context", 400);
}, context);

export { GET, POST };
