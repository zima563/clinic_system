-- AlterTable
ALTER TABLE `invoicedetail` ADD COLUMN `visitDetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `InvoiceDetail` ADD CONSTRAINT `InvoiceDetail_visitDetailsId_fkey` FOREIGN KEY (`visitDetailsId`) REFERENCES `VisitDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
