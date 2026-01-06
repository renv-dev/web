import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from "@/lib/helpers/response";
import { hasScope } from "@/lib/utils/is";

interface Context {
    params: Promise<{
        projectId: string;
        branchId: string;
    }>;
}

const GET = (req: NextRequest, ctx: Context) => withAuth(req, async (_, authCtx, ctx) => {
    const { projectId, branchId } = await ctx!.params;

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
            const hasReadProjectScope = hasScope(member.scopes, ["READ_PROJECT", "READ_BRANCH", "OWNER"]);
            if (!hasReadProjectScope) return forbiddenResponse("You do not have permission to view this project");
        } catch (error) {
            console.error("Error fetching branch:", error);
            return errorResponse("Failed to fetch branch");
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("Token does not have access to this project");
        if (hasScope(token.scopes, ["READ_PROJECT", "READ_BRANCH", "OWNER"]) === false) return forbiddenResponse("Token does not have permission to view this project");
    }

    try {
        const branch = await prisma.branch.findUnique({
            where: { id: branchId, projectId: projectId },
        });
        if (!branch) return notFoundResponse("Branch not found");
        return successResponse(branch);
    } catch (error) {
        console.error("Error fetching branch:", error);
        return errorResponse("Failed to fetch branch");
    }
}, ctx as Context);

const DELETE = (req: NextRequest, ctx: Context) => withAuth(req, async (_, authCtx, ctx) => {
    const { projectId, branchId } = await ctx!.params;

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
            const hasManageBranchScope = hasScope(member.scopes, ["OWNER"]);
            if (!hasManageBranchScope) return forbiddenResponse("You do not have permission to manage branches in this project");
        } catch (error) {
            console.error("Error deleting branch:", error);
            return errorResponse("Failed to delete branch");
        }
    } else if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        if (token.projectId !== projectId) return forbiddenResponse("Token does not have access to this project");
        if (hasScope(token.scopes, ["OWNER"]) === false) return forbiddenResponse("Token does not have permission to manage branches in this project");
    }

    try {
        const branch = await prisma.branch.findUnique({
            where: { id: branchId, projectId: projectId },
        });
        if (!branch) return notFoundResponse("Branch not found");

        await prisma.branch.delete({
            where: { id: branchId },
        });
        return successResponse({ message: "Branch deleted successfully" });
    } catch (error) {
        console.error("Error deleting branch:", error);
        return errorResponse("Failed to delete branch");
    }
}, ctx as Context);

export { GET, DELETE };