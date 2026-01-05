import { NextRequest } from "next/server";
import { Session } from "better-auth";
import { token } from "@prisma/client";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { unauthorizedResponse } from "./helpers/response";

interface Context {
    params: Promise<{ [key: string]: string }>;
}

interface AuthContext {
    type: "session" | "token";
    session?: Session;
    apiToken?: token;
}

const withAuth = async (req: NextRequest, handler: (req: NextRequest, session: AuthContext, context?: Context) => Promise<Response>, context?: Context) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });
    if (!session?.session) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return unauthorizedResponse("Unauthorized: No token provided");
        }
        // Additional token validation logic can be added here
        try {
            const isValidToken = await prisma.token.findUnique({
                where: { token: token, expiresAt: { gt: new Date() } },
            });
            if (isValidToken) return handler(req, { type: "token", apiToken: isValidToken }, context);
            return unauthorizedResponse("Unauthorized: Invalid token");
        } catch (error) {
            return unauthorizedResponse("Unauthorized: Token validation error");
        }
        
    }
    return handler(req, { type: "session", session: session.session }, context);
};

export { withAuth, type AuthContext };