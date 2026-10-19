# Plan: Fix Encoding Mojibake, Driver Portal Crash, and Customer Demo Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Overview
This plan resolves 4 critical issues reported by the user:
1. **Vietnamese Mojibake Font Encoding:** Corrupted text in `provinces`, `stations`, `bus_types`, and `users` tables in SQL Server (e.g., "HĂ Ná»™i", "Ä Ă Náºµng", "HĂ¡"" ChĂ Minh", "Báº¿n xe Miá» n Ă ng", "Nguyá»…n VÄƒn A").
2. **Driver Portal Blank Screen:** Runtime crash on `/driver/schedules` due to `schedule` prop passed instead of `trip` to `DriverTripCard`, route typo `/driver/schedule` vs `/driver/schedules` in `LoginPage.tsx`, and lack of a dedicated Driver Layout.
3. **TypeScript Build Verification:** `npx tsc -b --noEmit` failures in `RegisterPage.tsx` (`loading` vs `isLoading`) and `DriverSchedulesPage.tsx`.
4. **Customer Search & Demo Data Starvation:** Only 4 future trips existed across only 2 routes; popular featured routes like Hà Nội - Đà Nẵng (`RT-HAN-DAN`) and Sài Gòn - Đà Nẵng (`RT-SGN-DAN`) had 0 trips, leaving customer search empty on homepage routes.

---

## Tasks

### Task 1: Database Mojibake & Encoding Remediation
- [ ] Write and execute an idempotent SQL update script to repair all Vietnamese strings in `provinces`, `stations`, `bus_types`, and `users` using UTF-8 `N'...'` literals.
- [ ] Verify using node script that `SELECT * FROM provinces`, `SELECT * FROM stations`, and `SELECT * FROM bus_types` return 100% clean, uncorrupted Vietnamese text.
- [ ] Update `database/scripts/10_seed_data.sql` to maintain clean UTF-8 encoding.

### Task 2: Driver Portal Bug Fixes & Driver Layout
- [ ] Fix `client/src/pages/driver/DriverSchedulesPage.tsx` to pass `<DriverTripCard trip={schedule} />`.
- [ ] Make `client/src/pages/driver/components/DriverTripCard.tsx` defensive to accept both `trip` or `schedule` prop to prevent runtime crashes.
- [ ] Fix redirect path in `client/src/pages/LoginPage.tsx` for DRIVER from `'/driver/schedule'` to `'/driver/schedules'`.
- [ ] In `client/src/App.tsx`, add route alias redirecting `'/driver/schedule'` to `'/driver/schedules'`.
- [ ] Add a clean `DriverLayout` or top navigation bar for Driver portal with branding, driver identity, and logout action.

### Task 3: Client Type and Compilation Fixes
- [ ] In `client/src/pages/RegisterPage.tsx`, replace `loading={isSubmitting}` with `isLoading={isSubmitting}`.
- [ ] Verify `npx tsc -b --noEmit` exits with code 0.
- [ ] Verify `npm run lint` exits with code 0 (0 warnings, 0 errors).

### Task 4: Rich Realistic Demo Data for Customer & Driver
- [ ] Seed comprehensive trips for:
  - `RT-HAN-DAN` (Hà Nội <-> Đà Nẵng)
  - `RT-SGN-DAN` (Sài Gòn <-> Đà Nẵng)
  - `RT-HAN-NBI` (Hà Nội <-> Ninh Bình)
  - `RT-SGN-DLI` (Sài Gòn <-> Đà Lạt)
- [ ] Provide trips across multiple dates: today (`2026-10-20`), tomorrow (`2026-10-21`), and throughout the upcoming week (`2026-10-22` to `2026-10-26`).
- [ ] Provide varied times of day (morning 06:00, 08:30; afternoon 13:30, 15:00; evening 19:00, 21:00) with realistic pricing and bus types.
- [ ] Add additional bus records (`BUS-05` to `BUS-08`) with complete seats so concurrency and assignment constraints are respected.
- [ ] Assign drivers (`DRV-01`, `DRV-02`) so driver schedule portal displays active assigned trips.

### Task 5: End-to-End Verification
- [ ] Test API search for Hà Nội -> Đà Nẵng on today's date.
- [ ] Test API search for Sài Gòn -> Đà Lạt and Hà Nội -> Ninh Bình.
- [ ] Test driver schedules query for `USR-DRV-1`.
- [ ] Confirm no compilation errors (`tsc -b`), lint errors, or broken imports.
