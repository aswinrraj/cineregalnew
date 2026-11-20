# CinéRegal Backend API 🎬

A modern, robust Express.js & MongoDB RESTful API backend for **CinéRegal** — the premium movie discovery, ticket booking, and film review platform.

---

## 🚀 Features

- **Authentication & Authorization**:
  - User registration & login with secure password hashing (`bcryptjs`)
  - JWT (JSON Web Token) authentication with bearer authorization headers
  - Profile retrieval, profile updates, and movie watchlist toggle
- **Movies Management**:
  - Full movie catalog with high-resolution TMDB artwork, metadata, cast, director, and YouTube trailer links
  - Filtering by search query (`?search=`), genre (`?genre=`), and formats (`?format=`)
  - Detail endpoint supporting numeric IDs or MongoDB ObjectIds
- **Theatres & Showtimes**:
  - Theatres across major Indian metropolitan hubs (Mumbai, Delhi, Bengaluru, etc.)
  - Amenities (IMAX with Laser, Dolby Atmos, Luxe Recliners) and showtimes
- **Ticket Bookings & Conflict Prevention**:
  - Live seat reservation engine with double-booking prevention
  - Auto-generated reservation codes (e.g. `CINÉ-2026-XXXXX`)
  - Breakdown of ticket price and convenience fees
  - Real-time seat occupancy lookup (`/api/bookings/seats`)
- **Reviews & Critics**:
  - Audience and critic reviews tied directly to movies
  - Star ratings (1 to 5 stars) and author attribution
- **Feedback & Support**:
  - Direct customer feedback, signed-in trackable support tickets, and admin status management
  - Customer cancellation with refund-request status tracking; demo bookings are clearly non-refundable
- **Admin workspace**:
  - Separate `/admin/login` and `/admin` React routes, with backend-verified admin-only API access
  - MongoDB-backed overview, movie editing and publishing, review moderation, support queue, and booking ledger
  - New catalogue entries can be imported from Wikidata and Wikipedia without an API key; available metadata and artwork are retrieved server-side
  - Timestamped audit entries for movie, review, and support changes
- **Payment clarity**:
  - The current checkout is explicitly marked as a demo transaction; no payment gateway or card data is used
- **Resilient Fallback Mode**:
  - Connects to local MongoDB (`mongodb://127.0.0.1:27017/cineregal`) or MongoDB Atlas.
  - If MongoDB is not yet running on your local machine, the backend gracefully falls back to responsive in-memory stores so that API routes and UI testing work immediately without crashing.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.x
- **Database / ODM**: MongoDB + Mongoose 8.x
- **Security & Tokens**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`
- **Logging**: `morgan`

---

## 📁 Project Structure

```text
backend/
├── config/
│   └── db.js                 # MongoDB connection & fallback handling
├── controllers/
│   ├── adminController.js    # Admin auth, reporting, catalogue, import, moderation, and support
│   ├── authController.js     # Auth, profile, and watchlist handlers
│   ├── movieController.js    # Movie discovery and search handlers
│   ├── theatreController.js  # Theatres and screen layout handlers
│   ├── bookingController.js  # Booking creation, seat conflict check, history
│   ├── reviewController.js   # Film review and critic note handlers
│   └── feedbackController.js # Visitor feedback and contact handlers
├── data/
│   ├── seedAdmin.js          # Idempotent local demo administrator seed
│   ├── seedData.js           # Initial 12 movies, reviews, and theatres
│   └── seed.js               # Database seeding CLI script
├── middleware/
│   ├── authMiddleware.js     # JWT token verification & admin guards
│   └── errorMiddleware.js    # 404 and central error handling
├── models/
│   ├── AdminAction.js        # Timestamped administrator audit records
│   ├── User.js               # Mongoose User schema & password hashing
│   ├── Movie.js              # Mongoose Movie schema with text indexes
│   ├── Theatre.js            # Mongoose Theatre schema
│   ├── Booking.js            # Mongoose Booking schema
│   ├── Review.js             # Mongoose Review schema
│   └── Feedback.js           # Mongoose Feedback schema
├── routes/
│   ├── adminRoutes.js        # /api/admin endpoints (except login, all protected)
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── movieRoutes.js        # /api/movies endpoints
│   ├── theatreRoutes.js      # /api/theatres endpoints
│   ├── bookingRoutes.js      # /api/bookings endpoints
│   ├── reviewRoutes.js       # /api/reviews endpoints
│   └── feedbackRoutes.js     # /api/feedback endpoints
├── .env                      # Local environment configuration
├── .env.example              # Example environment template
├── package.json              # Backend dependencies and scripts
└── server.js                 # Express app entry point
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create or verify `.env` in the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/cineregal
JWT_SECRET=cineregal_jwt_super_secret_production_key_2026
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
ADMIN_LOGIN_ID=admin@123
ADMIN_PASSWORD=admin@123
ADMIN_EMAIL=admin@cineregal.com
ADMIN_JWT_EXPIRE=8h
```
> **Tip for MongoDB Atlas**: If using MongoDB Atlas cloud database, set `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cineregal?retryWrites=true&w=majority`.

The `admin@123` / `admin@123` values are **local-demo credentials only**. They are seeded into MongoDB with a bcrypt hash and are never sent to the browser. Set `ADMIN_LOGIN_ID`, `ADMIN_PASSWORD`, and `ADMIN_EMAIL` to deployment-specific values before production; production does not seed the local defaults. Movie import searches Wikidata and Wikipedia and requires no API key; metadata coverage and image quality vary by title. The dashboard reads and writes existing collections; it does not create duplicate movie, customer, review, booking, or feedback collections.

### 3. Seed Database (Optional)
```bash
npm run seed
```
*(The server also auto-seeds the initial movies, theatres, and reviews on first boot if the database is empty, and idempotently ensures the configured local demo administrator.)*

### 4. Run Development Server
```bash
npm run dev
# or: npm start
```
The server will start at `http://localhost:5000`.
Run the frontend from `frontend/` with `npm install` and `npm run dev`. Open `/admin/login` for the separate admin sign-in and `/admin` for the protected workspace.

---

## 📡 API Reference

### Health & Information
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | API description & directory | Public |
| `GET` | `/api/health` | Service health, uptime & DB status | Public |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user (`name`, `email`, `password`, `city`) | Public |
| `POST` | `/api/auth/login` | Authenticate user (`email`, `password`) | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private (Bearer JWT) |
| `PUT` | `/api/auth/profile` | Update profile (`name`, `email`, `city`, `preferences`) | Private (Bearer JWT) |
| `POST` | `/api/auth/watchlist/toggle` | Toggle movie in user watchlist (`movieId`) | Private (Bearer JWT) |
| `POST` | `/api/auth/forgot-password` | Simulates reset instructions dispatch | Public |

### Movies (`/api/movies`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/movies` | Get movies (`?search=`, `?genre=`, `?format=`, `?featured=`) | Public |
| `GET` | `/api/movies/:id` | Get movie by numeric id (e.g. `1`) or ObjectId | Public |
| `POST` | `/api/movies` | Create movie record | Admin |
| `PUT` | `/api/movies/:id` | Update movie record | Admin |
| `DELETE` | `/api/movies/:id` | Remove movie | Admin |

### Theatres (`/api/theatres`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/theatres` | List theatres (`?city=Mumbai`) | Public |
| `GET` | `/api/theatres/:id` | Get single theatre details | Public |
| `POST` | `/api/theatres` | Create a new theatre location | Admin |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/bookings` | Create ticket reservation with seat conflict check | Private (Bearer JWT) |
| `GET` | `/api/bookings/my` | View the signed-in user's booking history | Private (Bearer JWT) |
| `GET` | `/api/bookings/seats` | Get booked seats (`?movieTitle=&date=&showtime=&city=`) | Public |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel an owned future booking; creates a refund request only for a paid booking | Private (Bearer JWT) |
| `GET` | `/api/bookings/:id` | Lookup reservation by ID or `bookingCode` | Public |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/reviews` | Get reviews (`?movie=Dune: Part Two`) | Public |
| `POST` | `/api/reviews` | Submit new film review (`movieTitle`, `rating`, `text`) | Public / Auth |
| `DELETE` | `/api/reviews/:id` | Delete review | Private (Owner/Admin) |

### Feedback (`/api/feedback`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/feedback` | Submit visitor note / inquiry | Public |
| `POST` | `/api/feedback/tickets` | Open a support ticket for the signed-in customer | Private (Bearer JWT) |
| `GET` | `/api/feedback/tickets/my` | Track the signed-in customer's support tickets | Private (Bearer JWT) |
| `GET` | `/api/feedback` | List visitor feedback submissions | Admin |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/admin/auth/login` | Admin login (`loginId`, `password`); only endpoint without an admin token | Public |
| `GET` | `/api/admin/auth/me` | Verify persisted administrator access | Admin |
| `GET` | `/api/admin/overview` | MongoDB summary and explicit payment-status totals | Admin |
| `GET/POST` | `/api/admin/movies` | Paginated catalogue list and movie creation | Admin |
| `PUT/DELETE` | `/api/admin/movies/:id` | Edit or remove a catalogue movie | Admin |
| `GET` | `/api/admin/import/search?q=` | Search Wikidata and Wikipedia for film metadata | Admin |
| `GET` | `/api/admin/import/:id` | Fetch available Wikidata or Wikipedia metadata and artwork (`Q…` or `wiki-<pageid>`) | Admin |
| `GET/PATCH/DELETE` | `/api/admin/reviews` and `/api/admin/reviews/:id` | List, approve/hide, or remove reviews | Admin |
| `GET/PATCH` | `/api/admin/support` and `/api/admin/support/:id` | Filter and update support tickets and feedback | Admin |
| `GET/PATCH` | `/api/admin/bookings` and `/api/admin/bookings/:id/refund` | Paginated booking/payment ledger and refund-request status | Admin |

All admin endpoints other than login require a bearer token whose user is reloaded from MongoDB and has the `admin` role. Movie import uses publicly available Wikidata/Wikipedia data and may omit fields that are not available in those sources. The checkout is a demo without a payment gateway; marking a refund as processed records a manual action only, and must only be done after an actual external refund.

---

## 🧪 Testing with cURL / PowerShell

```powershell
# 1. Health check
curl http://localhost:5000/api/health

# 2. Search for a movie
curl "http://localhost:5000/api/movies?search=Oppenheimer"

# 3. Create a booking
$booking = @{
  movieTitle = "Dune: Part Two"
  date = "Today, 18 Nov"
  showtime = "5:20 PM"
  seats = @("E4", "E5")
  city = "Mumbai"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method Post -Body $booking -ContentType "application/json"
```
