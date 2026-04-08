# Implementation Plan - Automated Dental Image Ingestion & Viewing

This plan outlines the implementation of a background service to watch for dental X-ray images, ingest them into a PostgreSQL database, and display them in the clinical workflow.

## User Review Required

> [!IMPORTANT]
> **Storage Strategy**: Images will be stored as `BYTEA` in PostgreSQL. While this is suitable for an MVP, high-volume clinics may eventually need to migrate to S3 or a local file system for performance.
> **Folder Path**: I will assume the watch folder is `/images` at the root of the workspace, but this will be configurable via `.env`.
> **Deduplication**: I will implement a SHA-256 hash-based deduplication to prevent re-ingesting the same file.

## Proposed Changes

### Database Layer (Prisma)

#### [MODIFY] [schema.prisma](file:///d:/DENOVA/apps/api/prisma/schema.prisma)
- Add `ImagingRecord` model:
  - `id` (UUID)
  - `patientId` (Foreign Key to Patient)
  - `fileName` (Original name or renamed)
  - `mimeType` (image/jpeg, image/png)
  - `imageData` (BYTEA)
  - `fileSize` (Integer)
  - `hash` (String, indexed for deduplication)
  - `createdAt` (Timestamp)

---

### Backend Layer (Node.js/Express)

#### [NEW] `apps/api/src/modules/imaging/imaging.service.ts`
- Functions to create records, fetch records for a patient, and stream image data.
- Logic for file validation (size, MIME type) and compression using `sharp`.

#### [NEW] `apps/api/src/modules/imaging/watcher.service.ts`
- Initialized on app start.
- Uses `chokidar` to watch the configured directory.
- Logic:
  1. Detect new file.
  2. Extract OP Number from filename.
  3. Validate patient exists.
  4. Process via `ImagingService`.
  5. Delete/Rename source file after successful ingestion (as requested: rename to `{opNo}-{datetime}`).

#### [NEW] `apps/api/src/modules/imaging/imaging.routes.ts`
- `GET /patients/:id/images`: Returns list of metadata.
- `GET /images/:id`: Streams binary data with correct `Content-Type`.

#### [MODIFY] [index.ts](file:///d:/DENOVA/apps/api/src/index.ts)
- Register the new imaging routes: `app.use('/imaging', imagingRoutes);`
- Initialize the folder watcher on startup.

---

### Frontend Layer (React/Vite)

#### [NEW] `apps/web/src/components/treatments/ImagingSection.tsx`
- A visual gallery component that fetches and displays images for the current patient.
- Support for expanded view (modal) to see full-size X-rays.

#### [MODIFY] [TreatmentsPage.tsx](file:///d:/DENOVA/apps/web/src/pages/TreatmentsPage.tsx)
- Integrate `ImagingSection` into the clinical workflow.

## Open Questions

1. **Retention Policy**: Should we delete the original files from the `/images` folder after successful ingestion, or keep them renamed? (User mentioned renaming to `{op number}-date time`).
2. **Compression**: Do you have a specific target quality/resolution for the X-rays, or should we just ensure they stay under 10MB?

## Verification Plan

### Automated Tests
- Script to simulate EzDent export by dropping a file named `OP123.png` into the watch folder.
- Verify patient link in DB.
- Verify API returns correct binary data.

### Manual Verification
1. Start the API server.
2. Drop an image with a valid OP number into `D:/DENOVA/images`.
3. Check logs for "File processed" message.
4. Navigate to the treatment page for that patient and verify the image appears.
