/*
  Warnings:

  - You are about to alter the column `title` on the `service` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `desc` on the `service` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `service` MODIFY `title` JSON NOT NULL,
    MODIFY `desc` JSON NOT NULL;
