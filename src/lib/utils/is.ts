import { scopes } from "@prisma/client";

function hasScope(scopes: scopes[], requiredScopes: scopes | scopes[]): boolean {
    if (typeof requiredScopes === "string") {
        requiredScopes = [requiredScopes];
    }
    return requiredScopes.some((scope) => scopes.includes(scope));
}

export { hasScope };