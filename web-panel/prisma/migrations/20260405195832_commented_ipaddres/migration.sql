/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `vms` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "vms_ipAddress_idx";

-- DropIndex
DROP INDEX "vms_ipAddress_key";

-- AlterTable
ALTER TABLE "vms" DROP COLUMN "ipAddress";
