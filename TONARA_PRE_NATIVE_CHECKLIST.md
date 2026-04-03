# Tonara Pre-Native Checklist

This document is the working source of truth for Tonara before native iOS and Android development.

The browser app is a beta validation layer. The goal is not to perfect the web app forever, but to:

- lock the Tonara v1 product
- validate real usage
- remove avoidable uncertainty before native build work starts

## 1. Tonara v1 Product Lock

These should be treated as locked unless there is a deliberate product decision to change them.

### Core modes

- `Refine & Translate`
- `Translate only`

### Plans

#### Guest

- `10` refines/day
- `2` tones
- `14` languages
- no saved messages
- no bookmarks
- no saved tones

#### Free

- `30` refines/day
- `5` tones
- `14` languages
- `3` saved messages
- `1` bookmarked language
- no saved tones

#### Pro

- `300` refines/day
- `31` tones
- `100` languages
- `50` saved messages
- `10` bookmarked languages
- `5` saved tones

### Pricing

- `$3.99/month`
- `$29.99/year`

### Free tones

- Friendly
- Playful
- Poetic
- Gen A
- Flirty

### Pro tones

- Polite
- Casual
- Sincere
- Succinct
- Assertive
- Diplomatic
- Empathetic
- Apologetic
- Warm
- Enthusiastic
- Urgent
- Shakespearean
- Professional
- Motivational
- Humble
- Anger
- Royal
- Luxury
- Chaotic
- Sarcastic
- Savage
- Overexplaining
- Dad Joke
- Rapper
- Tea
- Noir

### Defaults

- default mode: `Refine & Translate`
- default tone strength: `Light`
- default source language: `Detect language`
- default target language: `Korean`

### App UI languages currently supported

- English
- Korean
- Japanese
- Spanish
- Portuguese
- Italian
- Russian
- Arabic
- French
- German
- Vietnamese
- Chinese (Simplified)
- Chinese (Traditional)

### Important localization behavior

- UI language follows device language by default
- users can manually override the UI language in Account
- unsupported device locales fall back to English
- Arabic has an RTL pass and should be treated as a supported RTL UI language

### Dictation behavior

- if source language is explicitly selected, dictation starts in that language
- if source language is `Detect language`, tapping mic first opens a dictation-language chooser
- users can `Use once` without changing source language
- users can `Set as source`
- last dictation language is remembered separately
- dictation language availability is tier-gated like language selection

## 2. Must-Do Before Native Build

These should happen before iOS work starts.

### A. Analytics

Add a minimal analytics layer so Tonara can answer:

- app opens
- refine started
- translate-only started
- refine succeeded
- translate-only succeeded
- tone selected
- tone strength selected
- save clicked
- save succeeded
- bookmark added/removed
- cap hit
- upgrade page viewed
- checkout started
- checkout succeeded
- sign-in started
- sign-in succeeded

This is the most important missing product signal before native development.

### B. Real-device beta QA

Run real-phone QA on:

- iPhone Safari
- Android Chrome

At minimum test:

- Home
- Refine & Translate
- Translate only
- Results
- Quick results
- Auth
- Account
- Upgrade
- Saved
- language switching
- dictation
- Arabic RTL

### C. Backend and API readiness

The native app should be able to reuse the current backend cleanly.

Confirm:

- request payloads are stable
- response shapes are stable
- errors are structured and predictable
- auth/session flow is mobile-friendly
- usage/cap logic does not depend on browser-only assumptions where it should not

### D. Failure-state review

Make sure these states feel intentional:

- network failure
- API timeout
- translation failure
- save failure
- sign-in failure
- unsupported speech recognition
- cap reached

## 3. Should-Do Before Native Build

These are not blockers, but they will reduce churn during native development.

### A. Write the native product spec

Define:

- tab structure
- screen list
- navigation model
- modal/sheet behavior
- onboarding/auth flow
- save/bookmark flow
- upgrade/subscription flow
- dictation behavior

### B. Finalize native-specific auth and billing decisions

Decide:

- Sign in with Apple for iOS
- Google sign-in for Android/iOS
- whether email/password remains in v1 native
- Apple App Store / Google Play subscription handling

### C. App Store preparation

Prepare:

- app name
- subtitle/tagline
- App Store / Play Store description
- screenshots plan
- support URL
- privacy policy

## 4. Nice-to-Have Before Native

- fuller localization polish across all UI languages
- another Arabic RTL polish pass after real device QA
- lightweight feedback collection from beta users
- internal dashboard for top tones, top languages, and conversion

## 5. What Not To Overinvest In

Because the browser app is a beta, Tonara should not keep overinvesting in web-only polish that does not materially improve native direction.

Avoid sinking too much time into:

- endless landing-page micro-polish
- browser-specific dictation perfection
- edge-case web UI refinements that do not change product learning

## 6. Recommended Order

1. Lock the v1 product decisions in this document.
2. Add analytics.
3. Run real-phone beta QA.
4. Clean up backend/mobile-readiness issues.
5. Write the native app spec.
6. Start iOS.
7. Build Android after iOS direction is proven or in parallel if capacity allows.

## 7. Immediate Next Step

The best next step is:

- implement the minimal analytics event layer in the current beta app

Without that, Tonara will go into native development with much less confidence about what users actually do and where they drop off.
