import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

interface RouteParams {
    params: Promise<{
        projectId: string;
        tokenId: string;
    }>;
}

// DELETE: Delete a token
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, tokenId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);

    if (!session?.session) {
        return errorResponse("Unauthorized", 401);
    }

    // Check membership
    const member = await prisma.member.findFirst({
        where: {
            userId: session.session.userId,
            projectId,
        },
    });

    if (!member) {
        return errorResponse("Project not found", 404);
    }

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
}
