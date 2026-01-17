-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "area" TEXT,
ADD COLUMN     "projectPicture" TEXT,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");
