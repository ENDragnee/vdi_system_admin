/*
  Warnings:

  - A unique constraint covering the columns `[userId,roleId]` on the table `role_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "role_users_userId_roleId_key" ON "role_users"("userId", "roleId");
