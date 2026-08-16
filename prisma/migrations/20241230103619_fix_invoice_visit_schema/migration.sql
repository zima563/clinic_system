/*
  Warnings:

  - You are about to drop the column `status` on the `visitdetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `paymentMethod` ENUM('Cash', 'Visa', 'instaPay', 'Wallet', 'payPal', 'CreditCard') NOT NULL DEFAULT 'Cash';

-- AlterTable
ALTER TABLE `visit` ADD COLUMN `paymentMethod` ENUM('Cash', 'Visa', 'instaPay', 'Wallet', 'payPal', 'CreditCard') NOT NULL DEFAULT 'Cash';

-- AlterTable
ALTER TABLE `visitdetail` DROP COLUMN `status`;
