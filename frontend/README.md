# CinéRegal frontend

A responsive React/Vite prototype for a premium movie discovery, reviews, and ticket booking experience.

## Run it in Visual Studio Code

1. Install **Node.js LTS** from nodejs.org if you do not already have it.
2. Open this folder (`movie-luxe`) in Visual Studio Code.
3. Open **Terminal → New Terminal**.
4. Install the project packages:

   ```bash
   npm install
   ```

5. Start the local development server:

   ```bash
   npm run dev
   ```

6. Open the local address printed in the terminal (usually `http://localhost:5173`). Keep the terminal running while you use the site. Press `Ctrl+C` to stop it.
7. Start the Express API from `../backend` for MongoDB-backed accounts, reviews, bookings, feedback, and administration. The separate admin entry points are `/admin/login` and `/admin`.

## Folder structure

```text
movie-luxe/
├── index.html              # Browser page and app mount point
├── package.json            # Dependencies and run commands
├── README.md               # Setup guide
└── src/
    ├── main.jsx            # Starts the React app
    ├── App.jsx             # Pages, sample content, and interactions
    └── styles.css          # Responsive visual design
```

## Included screens

- Discover: smoother rotating cinematic banner, real film examples, featured cards, watchlist, notifications panel, and critic-style quotes.
- Film details: synopsis, release date, cast, director, reviews, IMDb link, official YouTube trailer, and booking action.
- Tickets: expanded city list, date, format and price controls, theatre listings, selectable showtimes, and three seat maps (standard, IMAX, and recliner layouts).
- Demo checkout: payment method selector, order summary, and a clearly labelled confirmation interaction that does not charge money.
- Reviews: filter by film, choose a title before posting, and see the movie title beside each review.
- Account settings: editable profile fields update the header immediately, plus preference toggles and animated sign-in/sign-out.
- My history: booking records include cancellation and refund-request status. Demo checkouts are labeled and do not collect money.
- Customer support: signed-in customers can open a ticket, receive a reference code, and track its open / in-progress / resolved status.
- About and feedback pages.
- Customer sign-in and account creation form, linked from the footer.
- Separate responsive administrator workspace for catalogue, reviews, support, booking/payment reporting, and overview.

When the backend is running, customer and administrator data use the existing Express API and MongoDB collections. The administrator workspace requires a persisted admin-role account; it is not part of customer registration. The booking checkout remains a demo and does not charge for tickets.

## Movie data and IMDb

The initial catalogue contains sample film data and poster artwork. Adding a catalogue film in the admin area searches Wikidata and uses Wikipedia's public REST summary for available metadata and artwork. No API key or image upload is required; imported details can be reviewed and edited before saving. Open-data coverage varies by title, so some fields may need to be completed manually. The project does not scrape IMDb. A separate admin sign-in is available at `/admin/login`; the customer sign-up flow does not create administrators.

The YouTube player uses embedded videos; playback availability and autoplay behavior depend on YouTube, browser settings, and regional restrictions. Trailer IDs are included for the sample films.

## Suggested next steps

1. Configure and run MongoDB and the Express backend using `backend/.env.example`.
2. Change the local demo administrator credentials before deployment; see `backend/README.md`.
3. Configure a payment provider before treating any booking as paid; current checkout records are labelled demo, and cancellation of a demo booking does not create a refund.
4. Support tickets can be opened and tracked by signed-in customers; admins update their status in the admin workspace.
