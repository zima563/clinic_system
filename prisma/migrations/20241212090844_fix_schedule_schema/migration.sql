/*
  Warnings:

  - You are about to drop the `date` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scheduledate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_scheduleDateId_fkey`;

-- DropForeignKey
ALTER TABLE `scheduledate` DROP FOREIGN KEY `ScheduleDate_dateId_fkey`;

-- DropForeignKey
ALTER TABLE `scheduledate` DROP FOREIGN KEY `ScheduleDate_scheduleId_fkey`;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `fromTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `toTime` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `date`;

-- DropTable
DROP TABLE `scheduledate`;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_scheduleDateId_fkey` FOREIGN KEY (`scheduleDateId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
