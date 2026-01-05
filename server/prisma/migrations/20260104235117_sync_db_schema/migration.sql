-- AlterTable
ALTER TABLE `movie` ADD COLUMN `casts` JSON NULL,
    ADD COLUMN `category` JSON NULL,
    ADD COLUMN `countries` JSON NULL,
    ADD COLUMN `director` VARCHAR(191) NULL,
    ADD COLUMN `genres` JSON NULL;
