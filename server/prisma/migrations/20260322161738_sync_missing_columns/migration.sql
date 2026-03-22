/*
  Warnings:

  - A unique constraint covering the columns `[tracking_token]` on the table `stops` will be added. If there are existing duplicate values, this will fail.
  - The required column `tracking_token` was added to the `stops` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "stops" ADD COLUMN     "assigned_at" TIMESTAMP(3),
ADD COLUMN     "location_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tracking_token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stops_tracking_token_key" ON "stops"("tracking_token");
