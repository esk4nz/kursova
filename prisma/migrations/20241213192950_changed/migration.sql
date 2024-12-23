/*
  Warnings:

  - You are about to drop the column `date` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `time_from` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `time_till` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `reservations` table. All the data in the column will be lost.
  - The `status` column on the `reservations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `available` on the `tables` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `tables` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `tables` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[table_number]` on the table `tables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_restaurant,table_number]` on the table `tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customer_name` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_phone` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_surname` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `capacity` to the `tables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table_number` to the `tables` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ReservationCreator" AS ENUM ('user', 'manager');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('free', 'reserved', 'occupied');

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_table_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_user_id_fkey";

-- DropIndex
DROP INDEX "tables_id_restaurant_number_key";

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "date",
DROP COLUMN "time_from",
DROP COLUMN "time_till",
DROP COLUMN "user_id",
ADD COLUMN     "created_by" "ReservationCreator" NOT NULL DEFAULT 'user',
ADD COLUMN     "customer_name" TEXT NOT NULL,
ADD COLUMN     "customer_phone" TEXT NOT NULL,
ADD COLUMN     "customer_surname" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "edited_at" TIMESTAMP(6),
ADD COLUMN     "last_updated" TIMESTAMP(6) DEFAULT COALESCE(edited_at, created_at),
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "tables" DROP COLUMN "available",
DROP COLUMN "number",
DROP COLUMN "seats",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "status" "TableStatus" NOT NULL DEFAULT 'free',
ADD COLUMN     "table_number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tables_table_number_key" ON "tables"("table_number");

-- CreateIndex
CREATE UNIQUE INDEX "tables_id_restaurant_table_number_key" ON "tables"("id_restaurant", "table_number");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;
