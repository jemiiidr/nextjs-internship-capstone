UPDATE "tasks"
SET "due_date" = (
	date_trunc('day', "due_date" AT TIME ZONE 'UTC')
	+ interval '23 hours 59 minutes'
) AT TIME ZONE 'UTC'
WHERE "due_date" IS NOT NULL
	AND ("due_date" AT TIME ZONE 'UTC')::time = time '12:00:00';
