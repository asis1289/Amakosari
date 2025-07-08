-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "isForNewUser" BOOLEAN DEFAULT false,
ADD COLUMN     "targetCollectionId" TEXT,
ADD COLUMN     "targetProductId" TEXT;
