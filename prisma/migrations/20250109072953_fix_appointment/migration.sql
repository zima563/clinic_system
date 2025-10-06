/*
  Warnings:

  - You are about to drop the column `date` on the `appointment` table. All the data in the column will be lost.
  - Added the required column `dateId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateId` to the `VisitDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `date`,
    ADD COLUMN `dateId` INTEGER NOT NULL,
    ADD COLUMN `dateTime` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `visitdetail` ADD COLUMN `dateId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `Date`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitDetail` ADD CONSTRAINT `VisitDetail_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `Date`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
