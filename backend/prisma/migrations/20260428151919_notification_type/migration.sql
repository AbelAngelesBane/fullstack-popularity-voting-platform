/*
  Warnings:

  - You are about to alter the column `type` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('END_POLL', 'THREAD_REPLY') NOT NULL;
