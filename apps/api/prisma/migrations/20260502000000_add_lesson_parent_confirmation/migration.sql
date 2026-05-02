-- AlterTable: parental confirmation of lesson presence
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "confirmedByParentAt" TIMESTAMP(3);
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "confirmedByParentId" TEXT;
