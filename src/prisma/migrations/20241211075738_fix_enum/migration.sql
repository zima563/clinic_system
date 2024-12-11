-- AlterTable
ALTER TABLE `appointment` MODIFY `status` ENUM('pending', 'confirmed', 'canceled') NOT NULL DEFAULT 'pending';
