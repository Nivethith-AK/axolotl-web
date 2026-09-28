# Axolotl Portfolio Website

Official portfolio, discography, and commissions website for Axolotl (Composer / Music Producer).

## Overview

A responsive single-page web application featuring an interactive discography timeline, audio and video preview players, portfolio showcases, affiliate dossiers, and multi-language support.

## Tech Stack

- React 18
- React Router 6
- Vite
- HTML5 Canvas API
- Custom CSS with CSS variables and responsive layouts

## Features

- Discography: Interactive horizontal timeline with drag scrolling, category filtering (Releases / Featured), and track detail dossiers.
- Works: Commission archives with inline MP4 video previews and YouTube hover interactions.
- Portfolio: Desktop paginated grid and touch-enabled mobile carousel with project metadata.
- Affiliates: Collaborator network directory with tag filters and modal view.
- Theme Support: Dark and light mode toggle with local storage persistence.
- Internationalization: Support for 8 languages (EN, JA, ZH, KO, FR, ES, DE, RU) with dynamic typography loading for CJK locales.
- Telemetry & Effects: Boot sequence overlay, interactive particle canvas background, and custom decals.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

Clone the repository and install project dependencies:

```bash
npm install
```

## Collaborator Workflow

To work on the same repository, the repository owner must first invite you as a collaborator:

1. Open the repository on GitHub and go to **Settings > Collaborators**.
2. Select **Add people**, enter the collaborator's GitHub username or email address, and send the invitation.
3. The collaborator must accept the invitation before cloning or pushing to the repository.

After accepting the invitation, clone the repository and enter the project directory:

```bash
git clone https://github.com/Nivethith-AK/axolotl-web.git
cd axolotl-web
npm install
```

SSH can be used instead if it is configured for the collaborator's GitHub account:

```bash
git clone git@github.com:Nivethith-AK/axolotl-web.git
```

Create a feature branch before making changes:

```bash
git checkout -b feature/short-description
```

Before starting work, sync with the latest `main` branch. Repeat this before pushing so you do not overwrite changes from another collaborator:

```bash
git checkout main
git pull --rebase origin main
git checkout feature/short-description
git rebase main
```

Commit and push the feature branch to the same repository:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request on GitHub from the feature branch into `main` for review. If direct pushes to `main` are permitted, sync first and then push:

```bash
git checkout main
git pull --rebase origin main
git push origin main
```

Do not use `git push --force` on `main`. If Git reports that the remote contains commits you do not have locally, run `git pull --rebase origin main`, resolve any conflicts, and push again.

### Development

Run the local development server with hot module replacement:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build

Create an optimized static build:

```bash
npm run build
```

The compiled output will be placed in the `dist/` directory.

### Preview Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
├── public/                 # Static assets directly served by Vite
│   ├── fonts/              # Custom fonts (WDXLLubrifont, Gugi)
│   ├── images/             # Cover art, photos, icons, and decals
│   ├── locales/            # Localization dictionary files
│   ├── build-info.json     # Build metadata
│   ├── track-complexity-model.pdf # Track complexity document
│   └── vercel.json         # Deployment rewrites
├── src/
│   ├── components/         # Modular UI components
│   │   ├── about/          # Profile bio and photo gallery
│   │   ├── affiliates/     # Affiliates roster and modal dossiers
│   │   ├── common/         # Navbar, footer, canvas, and boot screen
│   │   ├── connect/        # Contact links and spam-protected email card
│   │   ├── discography/    # Timeline components and track modal
│   │   ├── hero/           # Hero landing section and secret panel
│   │   ├── music/          # Music player and stream embeds
│   │   ├── portfolio/      # Project grid and carousel
│   │   ├── tos/            # Terms of service layout and document viewer
│   │   └── works/          # Works cards with video hover previews
│   ├── context/            # Theme and Language React contexts
│   ├── data/               # Structured data for works, tracks, and affiliates
│   ├── pages/              # Top-level page routes
│   ├── styles/             # Application stylesheets
│   ├── App.jsx             # Main application layout and routes
│   └── main.jsx            # Application entry point
├── package.json
└── vite.config.js
```

## Deployment

The application is configured for deployment on static hosting platforms such as Vercel, Netlify, or Cloudflare Pages.

For Vercel, a `vercel.json` file is included in the project root to handle client-side routing rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## License

All musical compositions, audio recordings, artwork, and branding are copyright Axolotl. All rights reserved.
