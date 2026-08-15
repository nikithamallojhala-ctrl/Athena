# Data Provenance

## Primary dataset — performance domain

**National Running Club Database — Public Anonymized Dataset, v2.0.0**

- project: National Running Club Database
- coverage: 2004–May 2026
- license: CC BY 4.0
- upstream repository: https://github.com/National-Running-Club-Database/national_running_club_database_public_dataset
- upstream datasheet: https://github.com/National-Running-Club-Database/national_running_club_database_public_dataset/blob/main/DATASHEET.md
- Zenodo: https://zenodo.org/records/17917357
- local file: `data/raw/nrcd_v2_joined.csv`
- local SHA-256: `2fdeb707163779bdf00c01d5722474aca02f7b7a7ab1ea1cdbba2a9ab40a234d`
- local raw joined rows: 155,109

ATHENA deduplicates by result ID, parses timed individual running/hurdle/steeple outcomes, creates strictly prior athlete/event history, preserves missing context as missing, and does not remove difficult held-out discontinuities after observing their errors.

### Primary-domain limitations
- NIRCA/collegiate-club-centric rather than a census of all runners.
- Historical metadata are nonuniform.
- Weather availability varies by era/sport.
- Public identifiers are pseudonymous.
- Result/entry noise is possible.
- Race records do not contain daily wellness/medical variables.

## Secondary dataset — wellness domain

**PMData: A Sports Logging Dataset**

- publication: Thambawita et al. (MMSys 2020), DOI `10.1145/3339825.3394926`
- dataset portal: https://datasets.simula.no/pmdata/
- local files: `data/raw/pmdata/p01_wellness.csv` through `p16_wellness.csv`
- participants: 16
- raw wellness rows observed locally: 1,747
- per-file SHA-256 hashes: serialized in `data/derived/wellness_results.json`

ATHENA uses the public wellness files for a **separate next-day subjective-readiness experiment**. It does not merge PMData with NRCD.

### Secondary-domain processing
1. parse/validate published wellness scales;
2. consolidate same-person daily records;
3. sort by participant/date;
4. construct target from the next recorded report within three days;
5. create lag/rolling features using current or earlier information only;
6. split chronologically within each person for the main experiment;
7. choose the dynamic/persistence blend on calibration only;
8. separately run leave-one-participant-out transfer testing;
9. report participant-level uncertainty, robustness, and largest failures.

### Secondary-domain limitations
- only 16 participants;
- subjective self-report target;
- observational, not causal;
- different sport/population context from the NRCD performance study;
- not a clinical readiness dataset.

## Supporting evidence datasets — not reanalyzed as ATHENA results here

- SoccerMon — longitudinal soccer athlete monitoring, DOI `10.1038/s41597-024-03386-x`, open data DOI `10.5281/zenodo.10033832`.
- REST — athlete sleep/well-being support, DOI `10.5281/zenodo.16937033`.

These sources help justify the observation domain. They are not merged or described as ATHENA-specific empirical results unless a separate protocol is run.

## Data-use boundary

ATHENA does not attempt to re-identify public-data participants. Public datasets retain their original licenses and attribution requirements. Inclusion in the master research package does not transfer ownership to ATHENA.

## PMData license note

The current Simula dataset portal and the original 2020 publication expose slightly different Creative Commons descriptions. The original paper explicitly states CC BY-NC 4.0 for research/teaching use. ATHENA therefore treats the bundled raw PMData files under the more restrictive **CC BY-NC 4.0** interpretation unless clarified by the dataset owner. Raw PMData is excluded from the static deployment ZIP.
