/*
  Warnings:

  - Added the required column `ttile` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `ttile` VARCHAR(191) NOT NULL;
