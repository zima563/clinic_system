/*
  Warnings:

  - Added the required column `createdBy` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `InvoiceDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Specialty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `VisitDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `VisitInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `doctor` ADD COLUMN `createdBy` INTEGER NOT NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `invoicedetail` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `patient` ADD COLUMN `createdBy` INTEGER NOT NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `createdBy` INTEGER NOT NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `specialty` ADD COLUMN `createdBy` INTEGER NOT NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `visit` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `visitdetail` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `visitinvoice` ADD COLUMN `createdBy` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty` ADD CONSTRAINT `Specialty_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceDetail` ADD CONSTRAINT `InvoiceDetail_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitDetail` ADD CONSTRAINT `VisitDetail_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitInvoice` ADD CONSTRAINT `VisitInvoice_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
