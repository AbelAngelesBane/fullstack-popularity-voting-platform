/*
  Warnings:

  - Added the required column `updatedAt` to the `poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `poll` ADD COLUMN `editedById` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `poll` ADD CONSTRAINT `poll_editedById_fkey` FOREIGN KEY (`editedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
