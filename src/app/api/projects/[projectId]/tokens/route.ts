import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import crypto from "crypto";

interface RouteParams {
    params: Promise<{
        projectId: string;
    }>;
}

// GET: List all tokens
export async function GET(req: NextRequest, { params }: RouteParams) {
    const [{ projectId }, session] = await Promise.all([
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

    const tokens = await prisma.token.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
    });

    return successResponse(tokens);
}

// POST: Create a new token
export async function POST(req: NextRequest, { params }: RouteParams) {
    const [{ projectId }, session] = await Promise.all([
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

    // Generate a secure token
    const tokenValue = `renv_${crypto.randomBytes(32).toString("hex")}`;

    // Set expiration to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const token = await prisma.token.create({
        data: {
            token: tokenValue,
            userId: session.session.userId,
            projectId,
            expiresAt,
            scopes: ["READ_ENV"],
        },
    });

    return successResponse(token, "Token created successfully", 201);
}
