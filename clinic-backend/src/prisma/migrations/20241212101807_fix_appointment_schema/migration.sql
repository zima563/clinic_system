/*
  Warnings:

  - You are about to drop the column `scheduleDateId` on the `appointment` table. All the data in the column will be lost.
  - Added the required column `scheduleId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_scheduleDateId_fkey`;

-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `scheduleDateId`,
    ADD COLUMN `scheduleId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
