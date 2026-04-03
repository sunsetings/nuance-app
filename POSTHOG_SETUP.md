# Tonara PostHog Setup

This document is the recommended first PostHog setup for Tonara's beta web app.

The goal is not to build a giant analytics system yet. The goal is to answer the few product questions that matter before native iOS and Android development.

## 1. Add PostHog environment variables

Add these in Vercel for the web app:

- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`

Typical host:

- `https://us.i.posthog.com`

Then redeploy.

## 2. Verify Tonara is sending events

After redeploy:

1. Open Tonara in a browser
2. Go to PostHog Live Events
3. Confirm you see:
   - `app_open`
   - `screen_view`
4. Trigger a few flows and confirm:
   - `refine_started`
   - `refine_succeeded`
   - `translate_only_started`
   - `translate_only_succeeded`
   - `tone_selected`
   - `save_clicked`
   - `save_succeeded`

If those appear, the integration is working.

## 3. Event list already implemented

Tonara currently sends these events:

### App and navigation

- `app_open`
- `screen_view`
- `ui_language_changed`

### Translation and refinement

- `refine_started`
- `refine_succeeded`
- `refine_failed`
- `translate_only_started`
- `translate_only_succeeded`
- `translate_only_failed`

### Tones

- `tone_selected`
- `tone_strength_selected`

### Save and bookmarks

- `save_clicked`
- `save_succeeded`
- `bookmark_added`
- `bookmark_removed`

### Auth

- `auth_started`
- `auth_succeeded`

### Upgrade and billing

- `upgrade_viewed`
- `checkout_started`
- `subscription_portal_started`

### Limits and dictation

- `cap_hit`
- `dictation_started`
- `dictation_stopped`

## 4. Important event properties

Useful properties already included on different events:

- `user_tier`
- `ui_locale`
- `screen`
- `context`
- `from_lang`
- `to_lang`
- `tone`
- `tone_strength`
- `char_count`
- `plan`
- `method`
- `mode`
- `language`

## 5. First dashboards to build

Create one dashboard called:

- `Tonara Beta Core`

Add these tiles first.

### A. Usage split

Insight type:

- Trends

Events:

- `refine_succeeded`
- `translate_only_succeeded`

Break down by:

- event name

Question answered:

- Are users mainly using Tonara for tone refinement or straight translation?

### B. Top tones used

Insight type:

- Trends or breakdown table

Event:

- `tone_selected`

Break down by:

- `tone`

Filter:

- exclude empty `tone`

Question answered:

- Which tones matter most in the real product?

### C. Cap hits by tier

Insight type:

- Trends

Event:

- `cap_hit`

Break down by:

- `user_tier`

Question answered:

- Are limits creating pressure in the right places?

### D. Saves

Insight type:

- Trends

Events:

- `save_clicked`
- `save_succeeded`

Break down by:

- event name

Question answered:

- Are users trying to save, and does that behavior look meaningful?

### E. Upgrade interest

Insight type:

- Trends

Events:

- `upgrade_viewed`
- `checkout_started`

Break down by:

- event name

Question answered:

- Are users showing real intent to upgrade?

### F. UI language usage

Insight type:

- Trends or pie/table

Event:

- `app_open`

Break down by:

- `ui_locale`

Question answered:

- Which app UI languages matter most?

## 6. First funnels to build

Create one dashboard section called:

- `Conversion Funnels`

### Funnel 1. Guest to signup intent

Steps:

1. `app_open`
2. `upgrade_viewed` or `auth_started`
3. `auth_succeeded`

Filter suggestion:

- `user_tier = guest`

Question answered:

- Do guest users move toward account creation?

### Funnel 2. Upgrade intent

Steps:

1. `upgrade_viewed`
2. `checkout_started`

Break down by:

- `user_tier`

Question answered:

- How often does upgrade interest turn into checkout intent?

### Funnel 3. Refine completion

Steps:

1. `refine_started`
2. `refine_succeeded`
3. `save_clicked`

Question answered:

- Do users get through the refine flow and then value the output enough to try saving it?

### Funnel 4. Translate-only to refine upsell

Steps:

1. `translate_only_succeeded`
2. `screen_view` with `screen = quickresults`
3. `screen_view` with `screen = home`
4. `refine_started`

Question answered:

- Are users moving from standard translation into Tonara's more differentiated refine flow?

## 7. First retention questions

Once data starts coming in, create these retention cuts:

- users who completed `refine_succeeded`
- users who completed `translate_only_succeeded`
- users who completed `save_succeeded`

Question answered:

- Which core action best predicts that users come back?

## 8. Suggested first filters

These filters will make Tonara's data much more useful:

- `user_tier`
- `ui_locale`
- `from_lang`
- `to_lang`
- `tone`

## 9. What to ignore for now

Do not overbuild analytics yet.

Avoid spending time on:

- dozens of dashboards
- highly custom SQL
- marketing attribution complexity
- perfect naming cleanup unless something is truly confusing

The first job of PostHog is to answer:

- What are people actually using?
- Where do they drop off?
- Which flows matter enough to prioritize in the native app?

## 10. Recommended next review cadence

For the beta:

- check PostHog every 2 to 3 days
- look for:
  - refine vs translate-only split
  - top tones
  - cap-hit pressure
  - upgrade intent
  - which UI languages are actually used

That is enough signal to guide Tonara's iOS build without overcomplicating the beta.
