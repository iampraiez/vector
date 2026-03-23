-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "subscription_locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "settings" JSONB NOT NULL DEFAULT '{}';
