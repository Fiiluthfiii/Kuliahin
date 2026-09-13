-- Add faculty and university fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "faculty" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "university" TEXT;
