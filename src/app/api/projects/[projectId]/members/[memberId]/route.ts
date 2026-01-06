import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

interface RouteParams {
    params: Promise<{
        projectId: string;
        memberId: string;
    }>;
}

// DELETE: Remove a member
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, memberId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);

    if (!session?.session) {
        return errorResponse("Unauthorized", 401);
    }

    // Check membership and permissions
    const currentMember = await prisma.member.findFirst({
        where: {
            userId: session.session.userId,
            projectId,
        },
    });

    if (!currentMember) {
        return errorResponse("Project not found", 404);
    }

    const canManageMembers =
        currentMember.scopes.includes("OWNER") ||
        currentMember.scopes.includes("MANAGE_MEMBERS");

    if (!canManageMembers) {
        return errorResponse("Permission denied", 403);
    }

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
    if (memberToRemove.userId === session.session.userId) {
        return errorResponse("Cannot remove yourself from the project", 400);
    }

    await prisma.member.delete({
        where: { id: memberId },
    });

    return successResponse({ message: "Member removed" });
}

// PATCH: Update member permissions
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, memberId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);

    if (!session?.session) {
        return errorResponse("Unauthorized", 401);
    }

    // Check membership and permissions
    const currentMember = await prisma.member.findFirst({
        where: {
            userId: session.session.userId,
            projectId,
        },
    });

    if (!currentMember) {
        return errorResponse("Project not found", 404);
    }

    const canManageMembers =
        currentMember.scopes.includes("OWNER") ||
        currentMember.scopes.includes("MANAGE_MEMBERS");

    if (!canManageMembers) {
        return errorResponse("Permission denied", 403);
    }

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
}
