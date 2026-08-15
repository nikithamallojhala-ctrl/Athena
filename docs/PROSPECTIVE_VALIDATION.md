# Prospective Validation Mode

ATHENA includes an operational **Prospective Validation Mode** so future evidence can be collected without changing the hypothesis after outcomes are visible.

## What is implemented now

The browser app can:
1. register a target, minimum sample size, start date, analysis rule, hypothesis, and claim boundary;
2. lock the protocol and generate a deterministic version fingerprint;
3. disable protocol editing after lock;
4. capture future-dated records with the pre-session ATHENA state and later session-quality outcome;
5. reject duplicate-day/backdated-before-start records;
6. keep records local to the browser;
7. enforce a minimum-data gate;
8. after the gate, apply the pre-specified chronological 60/40 calibration/evaluation split;
9. compare a simple state-based linear predictor against a calibration-mean baseline on the later evaluation block;
10. report the result whether it wins or loses;
11. archive old protocol versions instead of silently overwriting them;
12. export protocol, records, analysis, and archive as JSON.

## Why this is not a fake prospective result

The **capability and protocol are implemented**. A prospective empirical result cannot honestly exist until future observations are collected after protocol lock. ATHENA therefore displays "No prospective result claimed yet" until the minimum-data gate is satisfied.

This is a strength, not a missing feature: it prevents backfilling and post-hoc threshold changes.

## Scope and supervision boundary

The built-in workflow is suitable for local self-tracking and method demonstration. A formal study involving other people may require appropriate adult/mentor/school/institutional review, consent/assent procedures, and privacy handling depending on the study design and jurisdiction. ATHENA does not itself provide ethics approval or participant consent.

The target is observational session quality, not diagnosis, injury prediction, return-to-play clearance, or a mandate to train harder.
