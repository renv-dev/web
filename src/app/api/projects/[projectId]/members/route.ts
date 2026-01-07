import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { hasScope } from "@/lib/utils/is";


interface Context {
    params: Promise<{
        projectId: string;
    }>;
}

// GET: List all members
const GET = (req: NextRequest, ctx: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const params = await ctx.params;
    const projectId = params.projectId;

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
            if (!user) return errorResponse("Unauthorized", 401);
            const member = user.members[0];
            if (!member) return errorResponse("Project not found", 404);
            const canReadMembers = hasScope(member.scopes, "OWNER") || hasScope(member.scopes, "MANAGE_MEMBERS");
            if (!canReadMembers) return errorResponse("Permission denied", 403);
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return errorResponse("API token does not have access to this project", 403);
        const canReadMembers = hasScope(token.scopes, "OWNER") || hasScope(token.scopes, "MANAGE_MEMBERS");
        if (!canReadMembers) return errorResponse("API token does not have permission to view members", 403);
    }

    try {
        const members = await prisma.member.findMany({
            where: { projectId },
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
        });
        return successResponse(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        return errorResponse("Failed to fetch members", 500);
    }
}, ctx as Context);

// POST: Invite a member
const POST = (req: NextRequest, ctx: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const params = await ctx.params;
    const projectId = params.projectId;

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
            if (!user) return errorResponse("Unauthorized", 401);
            const member = user.members[0];
            if (!member) return errorResponse("Project not found", 404);
            const canManageMembers = hasScope(member.scopes, "OWNER") || hasScope(member.scopes, "MANAGE_MEMBERS");
            if (!canManageMembers) return errorResponse("Permission denied", 403);
        } catch (error) {
            console.error("Error checking project access:", error);
            return errorResponse("Failed to verify project access", 500);
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return errorResponse("API token does not have access to this project", 403);
        const canManageMembers = hasScope(token.scopes, "OWNER") || hasScope(token.scopes, "MANAGE_MEMBERS");
        if (!canManageMembers) return errorResponse("API token does not have permission to manage members", 403);
    }

    try {
        const body = await req.json();
        const { email, scopes: requestedScopes } = body;

        if (!email || typeof email !== "string") {
            return errorResponse("Email is required", 400);
        }

        // Validate scopes if provided
        const validScopes = [
            "READ_ENV", "WRITE_ENV", "DELETE_ENV",
            "READ_PROJECT", "WRITE_PROJECT", "DELETE_PROJECT",
            "READ_BRANCH", "WRITE_BRANCH", "DELETE_BRANCH",
            "MANAGE_MEMBERS", "MANAGE_BILLING"
        ];
        
        let memberScopes = ["READ_ENV", "READ_PROJECT", "READ_BRANCH"]; // Default scopes
        
        if (requestedScopes && Array.isArray(requestedScopes)) {
            const invalidScopes = requestedScopes.filter((s: string) => !validScopes.includes(s));
            if (invalidScopes.length > 0) {
                return errorResponse(`Invalid scopes: ${invalidScopes.join(", ")}`, 400);
            }
            // Never allow setting OWNER scope
            if (requestedScopes.includes("OWNER")) {
                return errorResponse("Cannot assign OWNER scope to members", 400);
            }
            memberScopes = requestedScopes;
        }

        // Find the user by email
        const userToInvite = await prisma.user.findUnique({
            where: { email },
        });

        if (!userToInvite) {
            return errorResponse("User not found. They must sign up first.", 404);
        }

        // Check if already a member
        const existingMember = await prisma.member.findFirst({
            where: {
                projectId,
                userId: userToInvite.id,
            },
        });

        if (existingMember) {
            return errorResponse("User is already a member of this project", 409);
        }

        // Create member with specified or default permissions
        const newMember = await prisma.member.create({
            data: {
                projectId,
                userId: userToInvite.id,
                scopes: memberScopes,
            },
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
        });

        return successResponse(newMember, "Member invited successfully", 201);
    } catch (error) {
        console.error("Error inviting member:", error);
        return errorResponse("Failed to invite member", 500);
    }
}, ctx as Context);


export { GET, POST };
