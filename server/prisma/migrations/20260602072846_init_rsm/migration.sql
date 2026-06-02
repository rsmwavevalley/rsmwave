/*
  Warnings:

  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_bookingId_fkey`;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `checkedInAt` DATETIME(3) NULL,
    ADD COLUMN `isCheckedIn` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Booking_visitDate_idx` ON `Booking`(`visitDate`);

-- CreateIndex
CREATE INDEX `Booking_createdAt_idx` ON `Booking`(`createdAt`);

-- CreateIndex
CREATE INDEX `Booking_paymentStatus_isCheckedIn_idx` ON `Booking`(`paymentStatus`, `isCheckedIn`);

-- CreateIndex
CREATE UNIQUE INDEX `Payment_razorpayPaymentId_key` ON `Payment`(`razorpayPaymentId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
