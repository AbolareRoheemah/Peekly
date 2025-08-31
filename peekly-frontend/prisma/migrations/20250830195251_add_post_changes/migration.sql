/*
  Warnings:

  - You are about to drop the column `coinAddress` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `Post` table. All the data in the column will be lost.
  - Added the required column `ipfs` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "coinAddress",
DROP COLUMN "previewUrl",
ADD COLUMN     "ipfs" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "LikeCount" SET DEFAULT 0;
