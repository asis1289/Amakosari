-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('ALL', 'NEW_USER', 'PRODUCT', 'COLLECTION', 'CART');

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "type" "OfferType" NOT NULL DEFAULT 'ALL';
