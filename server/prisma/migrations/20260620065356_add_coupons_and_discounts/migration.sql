-- AlterTable
ALTER TABLE `booking` ADD COLUMN `couponCode` VARCHAR(191) NULL,
    ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0;
