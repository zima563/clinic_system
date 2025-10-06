/*
  Warnings:

  - You are about to drop the column `fromTime` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `toTime` on the `schedule` table. All the data in the column will be lost.
  - Changed the type of `date` on the `schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `fromTime`,
    DROP COLUMN `toTime`,
    DROP COLUMN `date`,
    ADD COLUMN `date` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Date` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` VARCHAR(191) NOT NULL,
    `fromTime` VARCHAR(191) NOT NULL,
    `toTime` VARCHAR(191) NOT NULL,
    `scheduleId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Date` ADD CONSTRAINT `Date_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
