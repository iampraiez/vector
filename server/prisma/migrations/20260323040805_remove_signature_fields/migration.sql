/*
  Warnings:

  - You are about to drop the column `signature_name` on the `stops` table. All the data in the column will be lost.
  - You are about to drop the column `signature_url` on the `stops` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "route_settings" JSONB DEFAULT '{"auto_optimize":false,"default_start_address":"","default_end_address":""}';

-- AlterTable
ALTER TABLE "stops" DROP COLUMN "signature_name",
DROP COLUMN "signature_url";
