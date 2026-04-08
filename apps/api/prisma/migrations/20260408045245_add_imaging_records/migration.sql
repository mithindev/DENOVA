-- CreateTable
CREATE TABLE "imaging_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "image_data" BYTEA NOT NULL,
    "file_size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "imaging_records_hash_key" ON "imaging_records"("hash");

-- CreateIndex
CREATE INDEX "imaging_records_patient_id_idx" ON "imaging_records"("patient_id");

-- AddForeignKey
ALTER TABLE "imaging_records" ADD CONSTRAINT "imaging_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
