-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "compressedSize" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalSize" INTEGER NOT NULL DEFAULT 0;
