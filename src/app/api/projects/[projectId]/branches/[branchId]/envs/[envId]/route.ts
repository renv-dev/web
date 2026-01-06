import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

interface RouteParams {
    params: Promise<{
        projectId: string;
        branchId: string;
        envId: string;
    }>;
}

// GET: Get a single environment variable
export async function GET(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, branchId, envId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);

    if (!session?.session) {
        return errorResponse("Unauthorized", 401);
    }

    // Check membership and permissions
    const member = await prisma.member.findFirst({
        where: {
            userId: session.session.userId,
            projectId,
        },
    });

    if (!member) {
        return errorResponse("Project not found", 404);
    }

    const canRead = member.scopes.includes("OWNER") || member.scopes.includes("READ_ENV");
    if (!canRead) {
        return errorResponse("Permission denied", 403);
    }

    const env = await prisma.env.findFirst({
        where: { id: envId, branchId },
    });

    if (!env) {
        return errorResponse("Environment variable not found", 404);
    }

    return successResponse(env);
}

// PATCH: Update an environment variable
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, branchId, envId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);

    if (!session?.session) {
        return errorResponse("Unauthorized", 401);
    }

    // Check membership and permissions
    const member = await prisma.member.findFirst({
        where: {
            userId: session.session.userId,
            projectId,
        },
    });

    if (!member) {
        return errorResponse("Project not found", 404);
    }

    const canWrite = member.scopes.includes("OWNER") || member.scopes.includes("WRITE_ENV");
    if (!canWrite) {
        return errorResponse("Permission denied", 403);
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

    const env = await prisma.env.update({
        where: { id: envId },
        data: {
            ...(key && { key }),
            ...(value !== undefined && { value }),
        },
    });

    return successResponse(env);
}

// DELETE: Delete an environment variable
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, branchId, envId }, session] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers(),
        }),
    ]);

    if (!session?.session) {
        return errorResponse("Unauthorized", 401);
    }

    // Check membership and permissions
    const member = await prisma.member.findFirst({
        where: {
            userId: session.session.userId,
            projectId,
        },
    });

    if (!member) {
        return errorResponse("Project not found", 404);
    }

    const canDelete = member.scopes.includes("OWNER") || member.scopes.includes("DELETE_ENV");
    if (!canDelete) {
        return errorResponse("Permission denied", 403);
    }

    // Verify env exists and belongs to the branch
    const existingEnv = await prisma.env.findFirst({
        where: { id: envId, branchId },
    });

    if (!existingEnv) {
        return errorResponse("Environment variable not found", 404);
    }

    await prisma.env.delete({
        where: { id: envId },
    });

    return successResponse({ message: "Environment variable deleted" });
}
