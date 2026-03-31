-- DropForeignKey
ALTER TABLE "role_users" DROP CONSTRAINT "role_users_userId_fkey";

-- AddForeignKey
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
