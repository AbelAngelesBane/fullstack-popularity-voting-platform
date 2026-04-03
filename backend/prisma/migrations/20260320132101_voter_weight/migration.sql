/*
  Warnings:

  - Added the required column `weight` to the `vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vote` ADD COLUMN `weight` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `vote` ADD CONSTRAINT `vote_pollId_fkey` FOREIGN KEY (`pollId`) REFERENCES `poll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
