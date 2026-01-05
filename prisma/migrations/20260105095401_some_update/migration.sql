/*
  Warnings:

  - You are about to drop the column `role` on the `member` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "scopes" AS ENUM ('OWNER', 'READ_ENV', 'WRITE_ENV', 'DELETE_ENV', 'READ_PROJECT', 'WRITE_PROJECT', 'DELETE_PROJECT', 'READ_BRANCH', 'WEITE_BRANCH', 'DELETE_BRANCH', 'MANAGE_MEMBERS', 'MANAGE_BILLING');

-- AlterTable
ALTER TABLE "branch" ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "member" DROP COLUMN "role",
ADD COLUMN     "scopes" "scopes"[] DEFAULT ARRAY['OWNER']::"scopes"[];

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scopes" "scopes"[] DEFAULT ARRAY['READ_ENV']::"scopes"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_token_key" ON "token"("token");

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
