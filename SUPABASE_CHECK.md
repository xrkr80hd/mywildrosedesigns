# Supabase Remote Check

- Last checked at (UTC): `2026-03-03T16:35:14Z`
- Project URL: `https://ahanzigwiclxzplgojeq.supabase.co`

## Current Result

- `orders` endpoint (`/rest/v1/orders`): `FAIL` (`404`)
- mistaken table exists as `public.orders` (literal dotted name): `YES`
- mistaken table columns detected: `id`, `created_at` only
- storage bucket `design-uploads`: `OK` (created)

## Diagnostic Notes

The API hint confirms schema/table mismatch:

```json
{
  "code": "PGRST205",
  "details": null,
  "hint": "Perhaps you meant the table 'public.public.orders'",
  "message": "Could not find the table 'public.orders' in the schema cache"
}
```

`/rest/v1/public.orders` returns `200`, which means a table literally named `public.orders` was created.

## Required Fix

Run the migration SQL from:

- `web/supabase/migrations/202603030001_initial_schema.sql`

This creates the correct table `public.orders` with required columns and indexes.

## Re-check Criteria

Success means:
- `GET /rest/v1/orders?select=id&limit=1` returns `200`
- `GET /storage/v1/bucket` includes `"id":"design-uploads"`
