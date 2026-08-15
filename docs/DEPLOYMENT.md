# Deployment

## Static deployment (recommended)
ATHENA requires no build step and no API key. Deploy the **contents** of the deployment package root to a static host such as GitHub Pages.

Required production paths include:
- `index.html`
- `styles.css`
- `manifest.webmanifest`
- `service-worker.js`
- `js/`
- `assets/`
- `data/derived/research_results.json`
- `data/derived/wellness_results.json`

Do not upload the ZIP itself as the website; extract it first.

## What is intentionally excluded from the deployment package
- raw NRCD data
- raw PMData files
- Python research scripts
- automated test harness/artifacts

Those remain in the master research package. The browser only needs the generated research JSON artifacts.

## Founder photos
Place:
- `assets/founders/nikitha.jpg`
- `assets/founders/shriyan.jpg`

If absent, initials render automatically.
