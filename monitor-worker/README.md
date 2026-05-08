# Currents — Tuna's monitor worker

This Cloud Run job runs hourly via Cloud Scheduler + Pub/Sub `currents.tick`.
For each active trip, Currents:

1. Refreshes the baseline via grounded search
2. Computes deltas (price, schedule, weather, advisory)
3. Publishes `replan.needed` if thresholds are breached
4. Eventually triggers `notify.user`

**Built on Day 7.** This directory is a placeholder for now.
