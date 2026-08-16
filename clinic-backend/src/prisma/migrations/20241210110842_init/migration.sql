/*
  Warnings:

  - Added the required column `fromTime` to the `Date` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toTime` to the `Date` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `date` ADD COLUMN `fromTime` DATETIME(3) NOT NULL,
    ADD COLUMN `toTime` DATETIME(3) NOT NULL;
