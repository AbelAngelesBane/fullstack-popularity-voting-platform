/*
  Warnings:

  - Added the required column `banned` to the `poll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `poll` ADD COLUMN `banned` BOOLEAN NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;
