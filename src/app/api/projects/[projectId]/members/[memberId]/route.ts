import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/helpers/response";
import { hasScope } from "@/lib/utils/is";

interface Context {
    params: Promise<{
        projectId: string;
        memberId: string;
    }>;
}

// DELETE: Remove a member
const DELETE = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, memberId } = await ctx.params;

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
            const currentMember = user.members[0];
            if (!currentMember) return forbiddenResponse("You are not a member of this project");
            
            const canManageMembers = hasScope(currentMember.scopes, ["OWNER", "MANAGE_MEMBERS"]);
            if (!canManageMembers) return forbiddenResponse("You do not have permission to manage members");

            // Find the member to remove
            const memberToRemove = await prisma.member.findFirst({
                where: {
                    id: memberId,
                    projectId,
                },
            });

            if (!memberToRemove) {
                return errorResponse("Member not found", 404);
            }

            // Check if trying to remove owner
            if (memberToRemove.scopes.includes("OWNER")) {
                return errorResponse("Cannot remove the project owner", 400);
            }

            // Cannot remove yourself
            if (memberToRemove.userId === userId) {
                return errorResponse("Cannot remove yourself from the project", 400);
            }

            await prisma.member.delete({
                where: { id: memberId },
            });

            return successResponse({ message: "Member removed" });
        } catch (error) {
            console.error("Error removing member:", error);
            return errorResponse("Failed to remove member", 500);
        }
    }

    return forbiddenResponse("Cannot manage members with an API token");
}, context);

// PATCH: Update member permissions
const PATCH = (req: NextRequest, context: Context) => withAuth(req, async (req, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, memberId } = await ctx.params;

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
            const currentMember = user.members[0];
            if (!currentMember) return forbiddenResponse("You are not a member of this project");
            
            const canManageMembers = hasScope(currentMember.scopes, ["OWNER", "MANAGE_MEMBERS"]);
            if (!canManageMembers) return forbiddenResponse("You do not have permission to manage members");

            const body = await req.json();
            const { scopes } = body;

            if (!Array.isArray(scopes)) {
                return errorResponse("Scopes must be an array", 400);
            }

            // Find the member to update
            const memberToUpdate = await prisma.member.findFirst({
                where: {
                    id: memberId,
                    projectId,
                },
            });

            if (!memberToUpdate) {
                return errorResponse("Member not found", 404);
            }

            // Cannot modify owner's scopes
            if (memberToUpdate.scopes.includes("OWNER")) {
                return errorResponse("Cannot modify owner's permissions", 400);
            }

            const updatedMember = await prisma.member.update({
                where: { id: memberId },
                data: { scopes },
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

            return successResponse(updatedMember);
        } catch (error) {
            console.error("Error updating member:", error);
            return errorResponse("Failed to update member", 500);
        }
    }

    return forbiddenResponse("Cannot manage members with an API token");
}, context);

export { DELETE, PATCH };
