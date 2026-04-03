-- AlterTable
ALTER TABLE `poll` ADD COLUMN `archived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `archivedAt` DATETIME(3) NULL,
    MODIFY `active` BOOLEAN NOT NULL DEFAULT false;
