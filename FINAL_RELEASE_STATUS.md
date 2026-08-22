# N999Bet Coordinated Release — 2026-08-23

## What was changed in this release

1. Removed customer-level Slotopol wallet synchronization from N999Bet deposit/withdrawal requests.
2. Changed game launch to use a separately configured Slotopol provider/service account rather than a customer's `slotopol_uid`.
3. Added club-aware provider-account mapping through `SLOTOPOL_CLUB_ACCOUNTS`.
4. Kept N999Bet as the customer-wallet authority for game bets and collected wins.
5. Preserved Slotopol's server-side club game-permission enforcement.
6. Made the user game-start response handling tolerant of the supported response envelope shapes.
7. Added deployment configuration documentation.

## Required deployment configuration

Set real values for:

- `DB_*`
- `JWT_SECRET`
- `SLOTOPOL_URL`
- `SLOTOPOL_ADMIN_EMAIL`
- `SLOTOPOL_ADMIN_PASSWORD`
- `SLOTOPOL_DEFAULT_CID`
- `SLOTOPOL_DEFAULT_UID` or `SLOTOPOL_CLUB_ACCOUNTS`

Do not put customer Slotopol UIDs into `SLOTOPOL_CLUB_ACCOUNTS`.

## Important production status

This is a coordinated source release, not a claim of regulatory certification or successful live-money deployment. The uploaded N999Bet repository contains scaffold/placeholder database migration material and the final live integration requires a real database schema, provider test environment, configured club accounts, HTTPS/secrets, reconciliation/idempotency, audit logging, backups and full end-to-end testing.

The release intentionally does not implement hidden per-customer outcome manipulation.
