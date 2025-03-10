-- DropIndex
DROP INDEX `jigsaw_category_name_key` ON `jigsaw_category`;

-- DropIndex
DROP INDEX `jigsaw_tag_name_key` ON `jigsaw_tag`;

-- CreateTable
CREATE TABLE `jigsaw_ai_generated` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `tags` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'NOT_STARTED',
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `recordId` INTEGER NOT NULL,
    `atomId` INTEGER NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `jigsaw_ai_generated_title_idx`(`title`),
    INDEX `jigsaw_ai_generated_recordId_idx`(`recordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jigsaw_ai_generated_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'NOT_STARTED',
    `result` TEXT NOT NULL,
    `predictionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jigsaw_ai_generated_record_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AICron` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('START', 'STOP') NOT NULL DEFAULT 'STOP',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
