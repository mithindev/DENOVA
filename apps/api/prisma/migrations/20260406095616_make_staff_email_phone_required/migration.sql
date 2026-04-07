/*
  Warnings:

  - Made the column `email` on table `staff` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
