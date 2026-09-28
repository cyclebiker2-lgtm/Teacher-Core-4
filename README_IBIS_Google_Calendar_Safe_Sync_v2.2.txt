IBIS Google Calendar Safe Sync v2.2 — Workspace Link Fix

Purpose
Fixes a reconciliation gap where an ICS calendar row matched the Google event identity but the lesson workspace lacked Google source references. The sync now attempts a conservative bridge from the matched calendar record to a workspace by normalized student name and the calendar record’s previous date/time. It normalizes dates for comparison and retains the existing workspace object and its preparation/history fields when moving the workspace key. If a destination workspace already exists, it flags a conflict rather than overwriting it.

Preview-only deployment
1. Keep the production site unchanged.
2. Back up the working IBIS data before testing.
3. Deploy this HTML to the teacher-core-4 preview.
4. Restore a fresh backup if the preview does not already contain your current test data.
5. Check the affected lesson’s preparation and materials before syncing.
6. Run Preview events, Compare with IBIS records, then Apply safe sync.
7. Confirm the lesson has the correct new time and retains its existing preparation status, notes, materials and reports. Run comparison again to check idempotence.

Important
This build has had a JavaScript syntax check only. It has not been tested against the user’s live browser data. It is still a manual preview-and-apply sync, not full incremental/background sync. Keep a backup and do not promote to production until the rescheduling and preparation-preservation case passes.
