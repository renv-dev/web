import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middleware";
import { successResponse, forbiddenResponse } from "@/lib/helpers/response";

const GET = (req: NextRequest) => withAuth(req, async (_, authCtx) => {
    if (authCtx.type === "token") {
        const token = authCtx.apiToken!;
        return successResponse({
            token
        }, "API token retrieved successfully.");
    }

    return forbiddenResponse("Session tokens are not allowed to access this route.");
});

export { GET };