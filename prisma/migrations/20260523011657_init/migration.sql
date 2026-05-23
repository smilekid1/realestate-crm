-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Cleveland',
    "state" TEXT NOT NULL DEFAULT 'OH',
    "zip" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'new',
    "motivation" TEXT,
    "askingPrice" REAL,
    "condition" TEXT,
    "timeline" TEXT,
    "source" TEXT,
    "beds" INTEGER,
    "baths" REAL,
    "sqft" INTEGER,
    "yearBuilt" INTEGER,
    "estimatedValue" REAL,
    "arv" REAL,
    "repairCost" REAL,
    "maxOffer" REAL,
    "ourOffer" REAL,
    "callbackDate" DATETIME,
    "lastContacted" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'medium'
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
