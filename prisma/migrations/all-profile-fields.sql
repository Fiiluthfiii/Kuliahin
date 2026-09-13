-- Complete migration for all profile fields
-- Run this if previous migrations failed

-- Add initial profile fields (if not exist)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nickname" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "yearEnrolled" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentSemester" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "academicAdvisor" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "targetIps" DOUBLE PRECISION;

-- Add new fields: faculty and university
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "faculty" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "university" TEXT;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
  AND column_name IN (
    'whatsapp', 'nickname', 'bio', 
    'yearEnrolled', 'currentSemester', 'academicAdvisor', 'targetIps',
    'faculty', 'university'
  )
ORDER BY column_name;
