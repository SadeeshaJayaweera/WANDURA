# Hybrid Recommender Plan

## Day 1 - Current State

### WorkerProfile Model

The `WorkerProfile` model in `prisma/schema.prisma` is currently structured as follows:

- **Identity & Relation:**
  - `id`: String (cuid)
  - `userId`: String (unique)
  - `user`: Relation to `User` model

- **Professional Details:**
  - `skill`: `SkillType` enum
  - `dailyRate`: Float
  - `hourlyRate`: Float (optional)
  - `experience`: Int (years of experience)
  - `bio`: String (optional)
  - `portfolioImages`: String Array (URLs)
  - `certifications`: String Array (URLs)

- **Status & Availability:**
  - `isVerified`: Boolean (default: false)
  - `isAvailable`: Boolean (default: true)

- **Location:**
  - `address`, `city`, `state`, `zipCode`: String (optional)
  - `latitude`, `longitude`: Float (optional)

- **Metrics & Reputation:**
  - `rating`: Float (default: 0)
  - `totalReviews`: Int (default: 0)
  - `totalJobs`: Int (default: 0)

- **Financials:**
  - `totalEarnings`: Float (default: 0)
  - `walletBalance`: Float (default: 0)

- **Timestamps:**
  - `createdAt`, `updatedAt`: DateTime

- **Indexes:**
  - `@@index([skill])`
  - `@@index([city])`
  - `@@index([isAvailable])`
  - `@@index([rating])`

### SkillType Enum

The `SkillType` enum contains the following construction-specific skills:
- `MASON`
- `TILE_LAYER`
- `WELDER`
- `STEEL_FIXER`
- `CARPENTER`
- `PLUMBER`
- `ELECTRICIAN`
- `PAINTER`

### Current Worker Search Implementation

Worker search is primarily driven by the `GET /api/workers` endpoint (`app/api/workers/route.ts`) and consumed by the workers listing page (`app/workers/page.tsx`).

**Filtering Mechanism:**
- **Skill Filter:** Exact match on the `skill` field (unless "ALL" is selected).
- **Location Filter:** Exact match on the `city` field.
- **Availability Filter:** Boolean match on `isAvailable` (typically `true`).
- **Price Range Filter:** Range query (`gte` and `lte`) on the `dailyRate` field using `minRate` and `maxRate`.
- **Rating Filter:** Minimum rating query (`gte`) using `minRating` on the `rating` field.

**Sorting & Output:**
- Results are strictly ordered by `rating` in descending order (`orderBy: { rating: 'desc' }`).
- The query joins with the `User` model to select basic user details (`id`, `name`, `email`, `phone`, `image`).

## Day 2 - Signal Utilities

We have implemented and unit-tested the core signals and utilities described in the paper's Section II-B:

- **Proximity Signal (`geo.ts`)**: Calculates the Haversine distance between two sets of coordinates.
- **Price Fit Signal (`priceFit.ts`)**: Calculates the relative price gap between a worker's daily rate and the customer's budget.
- **Content-Based Signal (`tagSimilarity.ts`)**: Calculates the cosine similarity between user preference vectors and worker tag vectors.
- **Normalization (`zscore.ts`)**: Implements Z-Score normalization for signal standardisation, matching the paper's `_znorm` behavior.
- **Baselines (`ruleBased.ts`, `contentBased.ts`)**: Implemented the rule-based (rating + reviews) and content-based baseline rankers.

All utilities have been fully covered with Jest unit tests.
