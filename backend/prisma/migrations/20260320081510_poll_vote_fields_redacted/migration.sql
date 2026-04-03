-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `vote_pollId_fkey`;

-- DropIndex
DROP INDEX `vote_pollId_deviceId_key` ON `vote`;

-- DropIndex
DROP INDEX `vote_pollId_userId_key` ON `vote`;

-- AddForeignKey
-- ALTER TABLE `invoice` ADD CONSTRAINT `invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
