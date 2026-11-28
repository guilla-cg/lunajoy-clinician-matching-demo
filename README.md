# LunaJoy clinician matching demo

A Vercel-ready full-stack demo for matching patients with fictional mental-health clinicians. It includes patient intake, ranked matching, transparent explanations, and architecture/scoring documentation.

## Features

- `GET /clinicians` returns the demo clinician catalogue.
- `POST /match` returns eligible clinicians ranked by weighted preference fit.
- `GET /match/explain` summarizes the top-ranked match; it also accepts POST for structured clients.
- Therapy-specific clinical needs are hidden for medication requests.
- Responsive React intake and results interface, bundled locally with Vite.
- No database, credentials, or patient-data persistence.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the project root at the repository root. The project uses the Vite preset, builds to `dist`, and includes Node.js functions; no environment variables are required.
4. Deploy. Each commit to the connected repository can create an automatic deployment.

## Run locally

Install dependencies, then run the Vite dev server:

```bash
npm install
npm run dev
```

The app will be served locally by Vercel Dev with `/match` and `/clinicians` routes.

## Documentation

- [Architecture](docs/architecture.md)
- [Matching logic](docs/matching-logic.md)

## Demo limitations

All clinician records are fictional. Availability, insurance participation, and workload are static mock values. The preference-fit score is not a clinical assessment, treatment recommendation, or guarantee of coverage or appointment availability.
