/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `appointment` table. All the data in the column will be lost.
  - Added the required column `scheduleDateId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_scheduleId_fkey`;

-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `scheduleId`,
    ADD COLUMN `scheduleDateId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_scheduleDateId_fkey` FOREIGN KEY (`scheduleDateId`) REFERENCES `ScheduleDate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
