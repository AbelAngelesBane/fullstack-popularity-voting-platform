/*
  Warnings:

  - You are about to drop the column `banned` on the `poll` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `poll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `poll` DROP COLUMN `banned`,
    DROP COLUMN `role`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `banned` BOOLEAN NULL;
