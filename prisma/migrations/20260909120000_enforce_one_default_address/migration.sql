-- Repair any pre-existing duplicate defaults before enforcing the invariant.
WITH "ranked_defaults" AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "id" DESC
    ) AS "default_rank"
  FROM "Address"
  WHERE "isDefault" = true
)
UPDATE "Address"
SET "isDefault" = false
FROM "ranked_defaults"
WHERE "Address"."id" = "ranked_defaults"."id"
  AND "ranked_defaults"."default_rank" > 1;

-- PostgreSQL partial unique index: a user may have many addresses, but only
-- one row whose isDefault value is true.
CREATE UNIQUE INDEX "Address_one_default_per_user"
ON "Address"("userId")
WHERE "isDefault" = true;
