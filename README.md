# FitCheck MVP

FitCheck is a small hackathon-ready web app that helps a student compare their current background against a job description before applying.

## Run

1. Open `./index.html` in a browser.
2. Paste a resume or background summary.
3. Paste a job description.
4. Choose an experience level.
5. Click `Analyze Fit`.

## Files

- `index.html`: single-page app shell and result layout
- `styles.css`: demo-ready styling
- `scoring.js`: deterministic scoring, fit band rules, and recommendations
- `app.js`: form handling, validation, loading state, and result rendering

## Scoring Logic

The total score is a weighted sum of four deterministic categories:

- Skills match: 40%
- Experience relevance: 30%
- ATS-inspired keyword and formatting alignment: 15%
- Role-specific signals like projects and tools: 15%

The analyzer compares known job terms, repeated keywords, experience signals, project evidence, and basic resume structure clues. It then assigns one of three fit bands:

- `80-100`: Strong fit. Apply confidently.
- `60-79`: Moderate fit. Apply with targeted improvements.
- `Below 60`: Stretch. Revise first or apply strategically.

## Manual Test Checklist

- Entering resume/background text works
- Entering a job description works
- Selecting an experience level works
- Clicking `Analyze Fit` shows a result without crashing
- Overall score appears from 0 to 100
- Breakdown cards use the required weights
- Fit band changes based on score
- Recommendations are specific and readable
- Empty inputs show a clear validation message
- The sample button populates a demo scenario quickly

## Notes

- No account system, backend, or database was added.
- No AI API was used because this repo did not include an existing AI integration pattern.
- No automated test runner existed in the workspace, so validation was kept lightweight and manual.
