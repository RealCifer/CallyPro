# Wall Calendar Pro

Wall Calendar Pro is an interactive frontend calendar component built with Next.js and Tailwind CSS.  
It is designed to replicate the feel of a physical wall calendar while providing modern interactivity, including date-range selection and contextual note-taking.

## Features

- Dynamic calendar grid generation for the active month
- Date range selection with:
  - Start date
  - End date
  - Highlighted in-between range
- Notes system linked to the selected date or date range
- Persistent data storage using `localStorage`
- Fully responsive layout for desktop and mobile devices
- Clean visual design inspired by a physical wall calendar
- Smooth interactions, transitions, and hover feedback
- Edge-case handling for selection flow (including reversed date clicks)

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- TypeScript

## Live Demo

[https://cally-pro-rnju.vercel.app/](https://cally-pro-rnju.vercel.app/)

## How It Works

- **Calendar generation logic**  
  The grid is generated dynamically for the current month using date utilities. The component computes:
  - The first weekday offset (Monday-first alignment)
  - Current month days
  - Overflow days from previous and next months to complete the grid rows

- **Date range selection state**  
  Selection is managed with `startDate` and `endDate` state:
  - First click sets `startDate`
  - Second click sets `endDate`
  - If second click is earlier than start, dates are automatically swapped
  - A new click after a completed range starts a fresh selection

- **Notes persistence with localStorage**  
  Notes are stored by range key (e.g., `YYYY-MM-DD_to_YYYY-MM-DD`) in `localStorage`.  
  When the same range is selected again, the stored note is loaded automatically.

## Project Structure

```text
.
├── app/
│   ├── globals.css
│   └── page.tsx
├── components/
│   └── WallCalendar.tsx
├── lib/
│   └── calendar.ts
├── public/
│   ├── hero-placeholder.svg
│   └── mountain-hero.svg
├── tests/
│   └── calendar.test.ts
├── package.json
└── README.md
```

## Installation and Setup

```bash
npm install
npm run dev
```

## Design Approach

The UI is built to reflect the visual hierarchy of a real wall calendar:

- A dominant hero image section at the top
- Structured calendar grid for clear day-by-day scanning
- Secondary notes panel for contextual planning
- Paper-like card styling, soft shadows, and clean typography to reinforce a physical calendar aesthetic while preserving readability and usability

## Responsiveness

The component is optimized for multiple screen sizes:

- **Desktop:** a richer, multi-panel layout with clear separation between calendar and notes
- **Mobile:** vertical flow that prioritizes readability, touch-friendly targets, and spacing
- Tailwind breakpoints are used to adapt spacing, typography, and grid behavior across viewport sizes

## Author
Aditya Khamait


