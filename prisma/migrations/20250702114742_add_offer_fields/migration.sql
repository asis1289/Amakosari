-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "discountValue" DOUBLE PRECISION,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "minimumOrderAmount" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3);
