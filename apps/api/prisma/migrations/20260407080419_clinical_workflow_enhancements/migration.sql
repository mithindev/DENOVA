/*
  Warnings:

  - You are about to drop the column `cost` on the `treatments` table. All the data in the column will be lost.
  - You are about to drop the `billing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `treatments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'WAITING';

-- DropForeignKey
ALTER TABLE "billing" DROP CONSTRAINT "billing_appointment_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "appointment_notes" TEXT,
ADD COLUMN     "clinical_details" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "address_1" TEXT,
ADD COLUMN     "address_2" TEXT,
ADD COLUMN     "address_3" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "birth_weight" DECIMAL(5,2),
ADD COLUMN     "consul_fee" DECIMAL(10,2),
ADD COLUMN     "current_weight" DECIMAL(5,2),
ADD COLUMN     "doctor_id" TEXT,
ADD COLUMN     "father_occupation" TEXT,
ADD COLUMN     "fathers_name" TEXT,
ADD COLUMN     "height" DECIMAL(5,2),
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "mother_occupation" TEXT,
ADD COLUMN     "mothers_name" TEXT,
ADD COLUMN     "op_no" TEXT,
ADD COLUMN     "other_fee" DECIMAL(10,2),
ADD COLUMN     "reg_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reg_fee" DECIMAL(10,2),
ADD COLUMN     "registered_by_id" TEXT;

-- AlterTable
ALTER TABLE "treatments" DROP COLUMN "cost",
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "quadrant_ll" TEXT,
ADD COLUMN     "quadrant_lu" TEXT,
ADD COLUMN     "quadrant_rl" TEXT,
ADD COLUMN     "quadrant_ru" TEXT,
ADD COLUMN     "treatment_done" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "billing";

-- DropEnum
DROP TYPE "BillingStatus";

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "total_tablets" INTEGER NOT NULL,
    "dosage" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
