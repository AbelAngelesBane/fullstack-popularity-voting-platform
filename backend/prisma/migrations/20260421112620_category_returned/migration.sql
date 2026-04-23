/*
  Warnings:

  - You are about to drop the column `category` on the `poll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `poll` DROP COLUMN `category`;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `poll` ADD CONSTRAINT `poll_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
