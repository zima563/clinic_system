/*
  Warnings:

  - Added the required column `ex` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `ex` BOOLEAN NOT NULL;
