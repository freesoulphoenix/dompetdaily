# Cleanup retained files

Deletes receipt and statement files after their 90-day retention window while keeping the app records for reporting.

Deploy:

```bash
supabase functions deploy cleanup-retained-files
```

Set secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set CLEANUP_SECRET=your-random-cleanup-secret
```

Schedule it daily from Supabase scheduled functions, or call the function from an external cron with:

```bash
curl -X POST \
  -H "x-cleanup-secret: your-random-cleanup-secret" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-retained-files
```
