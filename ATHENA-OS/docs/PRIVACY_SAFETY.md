# Privacy and Safety Boundaries

## Local-first behavior
ATHENA stores athlete profiles, daily check-ins, logs, and N-of-1 observations in browser `localStorage`. The canonical app contains no analytics SDK, ad tracker, remote founder-photo URL, or server upload routine.

“Local-first” means the static app is designed so these records remain on the current browser/device unless the user explicitly exports/copies them. It **does not** mean the browser storage is encrypted, HIPAA-certified, or suitable for clinical records.

The About section provides a local-data delete control. Research/public-data artifacts are separate static files and contain anonymized public records, not the local athlete's profile.

## Founder privacy
Personal founder email addresses present in the original source are removed from the final public package. Founder images are optional local assets, with initials as the fallback.

## Medical boundary
ATHENA does not diagnose, clear participation, or guarantee injury prevention. Health Hub is educational support and structured communication.

### Heat
ATHENA implements the National Weather Service Rothfusz Heat Index as an educational **shade-based apparent-temperature context**. It is not WBGT and is not presented as a sport-specific safe/unsafe cutoff.

Primary source: National Weather Service, Heat Index equation: https://www.weather.gov/media/ffc/ta_htindx.PDF

### Heart-rate zones
ATHENA displays the common `220 − age` maximum-heart-rate estimate and general American Heart Association percentage ranges. The AHA describes these as averages/general guidance; ATHENA does not use them as medical clearance or individualized prescriptions.

Source: https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates

### Teen sleep reference
For teen-oriented educational context, ATHENA uses the CDC/American Academy of Sleep Medicine reference of 8–10 hours for ages 13–18.

Source: https://www.cdc.gov/physical-activity-education/staying-healthy/sleep.html

### Possible concussion
ATHENA's safety language follows the conservative principle that suspected concussion should stop sport participation and return should be under healthcare-provider approval/supervision. It does not attempt to diagnose concussion.

Source: https://www.cdc.gov/heads-up/guidelines/returning-to-sports.html

## Safety override architecture
Safety flags are **not just another weighted readiness input**. If a serious flag is present, the performance/session layer abstains and directs the user toward appropriate adult/healthcare assessment language. This separation prevents a high performance score from “outvoting” a safety concern.

## SBAR
SBAR is a communication-format helper. It checks whether basic context has been entered and structures observations into Situation, Background, Assessment/current status, and Request. It does not independently assess medical severity beyond conservative rule-based escalation cues.
