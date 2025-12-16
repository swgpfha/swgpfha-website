-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "timeType" TEXT NOT NULL DEFAULT 'PartTime',
    "location" TEXT,
    "description" TEXT NOT NULL,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Opportunity_status_createdAt_idx" ON "Opportunity"("status", "createdAt");
