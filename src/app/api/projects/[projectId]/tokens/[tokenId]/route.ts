import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/helpers/response";

interface Context {
    params: Promise<{
        projectId: string;
        tokenId: string;
    }>;
}

// DELETE: Delete a token
const DELETE = (req: NextRequest, context: Context) => withAuth(req, async (_, authCtx, ctx) => {
    if (!ctx) return errorResponse("Params not found", 400);
    const { projectId, tokenId } = await ctx.params;

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

            // Find the token
            const token = await prisma.token.findFirst({
                where: {
                    id: tokenId,
                    projectId,
                },
            });

            if (!token) {
                return errorResponse("Token not found", 404);
            }

            await prisma.token.delete({
                where: { id: tokenId },
            });

            return successResponse({ message: "Token deleted" });
        } catch (error) {
            console.error("Error deleting token:", error);
            return errorResponse("Failed to delete token", 500);
        }
    } else if (authCtx.type === "token") {
        return forbiddenResponse("Cannot delete tokens with an API token");
    }

    return errorResponse("Invalid authentication context", 400);
}, context);

export { DELETE };
