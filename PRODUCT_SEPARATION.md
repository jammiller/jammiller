# Tremonix and DataPulse Social: separate products

## Owner instruction

Tremonix must not be confused with DataPulse Social. Treat them as distinct products and verify product identity before making deployment or domain changes.

## Recorded incident — 2026-10-12

- Both the `tremonix` and `jammiller` Vercel projects deployed the same commit from `jammiller/jammiller` on branch `copilot/research-course-builder-implementation`.
- The agent verified that the `tremonix` project was connected to that repository.
- With owner approval, the agent disconnected `tremonix` from `jammiller/jammiller` and verified that its Git connection was absent. This stops automatic Git deployments from that repository to Tremonix; it does not prohibit manual deployments.
- Existing deployments and domain assignments were not changed.

## Unresolved separation

At the time of the incident, Tremonix remained in the same Vercel team, and `tremonix.com` and `www.tremonix.com` were assigned to the `jammiller` project. The correct Tremonix repository, team, and domain destination were not established. Do not assume these historical assignments are correct, or move/delete them without confirming the intended destination and impact with the owner.

This is a dated record, not proof of current live configuration. Recheck live state before acting.

## PulseOS / Tremonix publishing correction — 2026-10-28

The default web build previously emitted both a shared multi-brand shell and
`pulseos.html`, even though the application on Tremonix renders Tremonix. Its
static default metadata identified DataPulse Social. The default build now uses
`tremonix/`, a dedicated React entry, an allowlisted public directory, and a
post-build guard that rejects foreign brand content. PulseOS retains its separate
`build:pulseos` build and production deployment; do not replace it from this PR.

The release operation disconnects `jammiller`'s shared Git auto-deployment so
future merges cannot automatically restore the old mixed output. Verify this
live before relying on it. An owner can still manually deploy or reconnect Git;
these protections are not immutable. Merge the corrective PR before resuming
releases, and establish an isolated repository/release source for each business.
Existing additional domains are not moved by this correction. This is publishing
isolation, not an audit or certification of customer-account/database isolation.
