/*
  Warnings:

  - A unique constraint covering the columns `[hostname]` on the table `vms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vms_hostname_key" ON "vms"("hostname");
