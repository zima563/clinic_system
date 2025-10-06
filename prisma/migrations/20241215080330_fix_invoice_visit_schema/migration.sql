/*
  Warnings:

  - The primary key for the `visitinvoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `invoiceDetailId` on the `visitinvoice` table. All the data in the column will be lost.
  - Added the required column `invoiceId` to the `VisitInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `visitinvoice` DROP FOREIGN KEY `VisitInvoice_invoiceDetailId_fkey`;

-- AlterTable
ALTER TABLE `visitinvoice` DROP PRIMARY KEY,
    DROP COLUMN `invoiceDetailId`,
    ADD COLUMN `invoiceId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`visitId`, `invoiceId`);

-- AddForeignKey
ALTER TABLE `VisitInvoice` ADD CONSTRAINT `VisitInvoice_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
