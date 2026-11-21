# Conversion tracking

## Tremonix website

Set `VITE_TREMONIX_GA4_MEASUREMENT_ID` to the verified Tremonix GA4 measurement ID when building the root Vite app. Leave it unset until the correct property is confirmed; the Tremonix cookie prompt and tracking remain disabled without it. Tracking starts only after consent, stored separately as `tremonix_cookie_consent`.

GA4 records page views after consent. The site emits `audit_completed`, `generate_lead`, and `booking_requested` events without sending contact details. A booking request is not a confirmed booking. Mark the applicable custom events as key events in the correct GA4 property.

## Command center

Run the updated `command-center/supabase/schema.sql` in its dedicated Supabase project. Database triggers record CRM lead creation/qualification/win transitions, increments to `email_opens`, customer creation, and revenue entries in `cc_conversion_events`. The dashboard displays lead-to-qualified-to-customer counts and daily event totals; `cc_daily_conversion_report` provides the grouped data and the dashboard refreshes every 30 seconds.

The command center and root site use separate Supabase projects. Website page views are not synchronized to the command-center funnel. Email-provider webhooks, Stripe-to-command-center sync, confirmed booking events, scheduled email reports, and conversion-drop alerts require provider configuration and a deliberate cross-project integration; they are not enabled by this change.
