/*
  Warnings:

  - You are about to drop the `UserPersmission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPersmission" DROP CONSTRAINT "UserPersmission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "UserPersmission" DROP CONSTRAINT "UserPersmission_userId_fkey";

-- DropTable
DROP TABLE "UserPersmission";

-- CreateTable
CREATE TABLE "user_permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "permissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
