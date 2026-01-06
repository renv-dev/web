import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";

interface RouteParams {
    params: Promise<{
        projectId: string;
        branchId: string;
    }>;
}

// GET: List all environment variables
export async function GET(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, branchId }, session] = await Promise.all([
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

    const envs = await prisma.env.findMany({
        where: { branchId },
        orderBy: { key: "asc" },
    });

    return successResponse(envs);
}

// POST: Create a new environment variable
export async function POST(req: NextRequest, { params }: RouteParams) {
    const [{ projectId, branchId }, session] = await Promise.all([
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

    // Verify branch exists and belongs to project
    const branch = await prisma.branch.findFirst({
        where: { id: branchId, projectId },
    });

    if (!branch) {
        return errorResponse("Branch not found", 404);
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
        return errorResponse("Key is required", 400);
    }

    // Validate key format (uppercase letters, numbers, underscores)
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
        return errorResponse("Key must start with a letter and contain only uppercase letters, numbers, and underscores", 400);
    }

    // Check for duplicate key
    const existingEnv = await prisma.env.findFirst({
        where: { branchId, key },
    });

    if (existingEnv) {
        return errorResponse("Environment variable with this key already exists", 409);
    }

    const env = await prisma.env.create({
        data: {
            key,
            value: value || "",
            branchId,
        },
    });

    return successResponse(env, "Created", 201);
}
