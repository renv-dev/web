/*
  Warnings:

  - The values [WEITE_BRANCH] on the enum `scopes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "scopes_new" AS ENUM ('OWNER', 'READ_ENV', 'WRITE_ENV', 'DELETE_ENV', 'READ_PROJECT', 'WRITE_PROJECT', 'DELETE_PROJECT', 'READ_BRANCH', 'WRITE_BRANCH', 'DELETE_BRANCH', 'MANAGE_MEMBERS', 'MANAGE_BILLING');
ALTER TABLE "public"."member" ALTER COLUMN "scopes" DROP DEFAULT;
ALTER TABLE "public"."token" ALTER COLUMN "scopes" DROP DEFAULT;
ALTER TABLE "member" ALTER COLUMN "scopes" TYPE "scopes_new"[] USING ("scopes"::text::"scopes_new"[]);
ALTER TABLE "token" ALTER COLUMN "scopes" TYPE "scopes_new"[] USING ("scopes"::text::"scopes_new"[]);
ALTER TYPE "scopes" RENAME TO "scopes_old";
ALTER TYPE "scopes_new" RENAME TO "scopes";
DROP TYPE "public"."scopes_old";
ALTER TABLE "member" ALTER COLUMN "scopes" SET DEFAULT ARRAY['OWNER']::"scopes"[];
ALTER TABLE "token" ALTER COLUMN "scopes" SET DEFAULT ARRAY['READ_ENV']::"scopes"[];
COMMIT;
