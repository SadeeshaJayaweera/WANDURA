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

## Day 3 - Collaborative Model Engine

We designed and implemented a batched offline-SVD calculation pipeline to power the Collaborative Filtering arm, matching the architecture detailed in the paper's **Section II-B (Item 3)**.

- **Interaction Matrix Construction (`buildInteractionMatrix.ts`)**: We query all `COMPLETED` bookings to fetch the known historical interactions and explicitly match the `rating` assigned via the unstructured `Review` records.
- **Factorization (`svd.ts`)**: We use the `ml-matrix` library to execute a Truncated SVD over the interaction matrix, extracting customer and worker latent factors (defaulting to 12 components) scaled by singular values.
- **Storage & Caching (`modelCache.ts`)**: We implemented read/write abstractions using Prisma to store the serialized latent factors inside the `RecommendationModelCache` JSON column.
- **Scoring & Fallbacks**:
  - `collaborativeScore.ts`: Performs fast dot-product ranking for customers inside the training matrix (warm-start).
  - `popularityFallback.ts`: Computes a mean rating score across past booking interactions as a fallback mechanism for cold-start customers.
- **Offline Batch Job (`scripts/recompute-collaborative-model.ts`) & Internal API (`app/api/internal/recompute-recommendations/route.ts`)**: Encapsulates the matrix extraction, SVD factorization, and caching logic, and outputs diagnostic sparsity statistics for model health monitoring.

## Day 4 - Model Pipeline Orchestration & Experimentation

We implemented the `rankPool` orchestrator which serves as the primary entry point for the recommendation engine. 

- **Feature Flag Routing (`featureFlag.ts`)**: A new environment variable `RECOMMENDATION_MODEL` controls which algorithm is executed in production (`hybrid`, `rule_based`, `content_based`, or `collaborative`). 
- **Graceful Degradation**: If `hybrid` is active, it seamlessly merges the baseline heuristics with the offline-trained Collaborative Filtering scores, safely falling back to popularity/cold-start methods for new users.
- **Future Work Fulfillment**: This dynamic routing explicitly operationalizes the paper's **Future Work item (iv)**, allowing us to seamlessly A/B test or completely swap out the underlying models in production without touching the frontend codebase.
- **Explainability Logs (`RecommendationLog`)**: Every recommendation response traces the exact Z-Score contribution breakdown (proximity, price, rating, tag, and collab) directly into the database for further ML analysis and tuning.

## Day 5 - API Integration & ML Analytics

We successfully operationalized the model by surfacing it directly via the API layer and implementing analytical observability:

- **Primary API Route (`POST /api/recommendations`)**: We exposed the pipeline via a dedicated, type-safe API endpoint that integrates strictly with Zod validation (`recommendationRequestSchema`). It includes graceful fallback handling (`NO_QUALIFIED_WORKERS`) and 500 error obfuscation.
- **Legacy Integration (`GET /api/workers`)**: Added a seamless, backward-compatible `sort=recommended` proxy to allow existing frontend interfaces to hit the ML model without massive structural rewrites.
- **Request Cache (`requestCache.ts`)**: Implemented a lightweight, robust LRU cache (hashed request bodies, 30s TTL, 500 items max) to short-circuit identical, rapid-fire API requests before hitting the DB or the ML orchestrator.
- **Analytics Endpoint (`GET /api/admin/recommendation-metrics`)**: Added an `ADMIN` gated metrics endpoint matching the paper's **Section III-C**. It dynamically filters the `RecommendationLog` by an ISO date range, bucketing workers by `totalReviews` (New: 0-5, Mid: 6-20, Established: 21+), to track and analyze ML exposure distribution ratios.

## Day 6 - UI Integration & Conversion Tracking Rollout

We finalized the full-stack rollout of the recommendation engine by deeply integrating it into the core user journey:

- **Graceful UI Adoption**: We deployed a seamless, local-state UI toggle (`Recommended for you` / `All results`) on the worker search page. This allows the new ML-driven ranking to be the default experience while preserving the legacy filter view, enabling live comparisons during the rollout.
- **Qualitative Interpretability**: Built `MatchScoreBadge` to dynamically translate raw, unbounded ML hybrid scores into user-friendly percentiles (e.g. "Great match", "Good match"), hiding the statistical complexity from the end user.
- **End-to-End Tracking**: We structurally tied the ML recommendations to actual business outcomes by modifying the `Booking` schema to store a nullable `recommendationLogId`. 
- **Future Work Fulfillment**: By minting and passing strict UUIDs down from the `rankPool`, through the frontend `trackRecommendationClick` telemetry, and straight into the finalized Postgres Booking records, we have successfully operationalized the paper's **Future Work item (i)**. We are no longer limited to synthetic evaluations; we can now definitively measure real conversion outcomes—knowing exactly which ranked results actively drive confirmed bookings.

## Day 7 - Live Observability & Analytical Reproducibility

To ensure the production system behaves as intended and adheres to the academic outcomes documented in the original research, we built a suite of live observability tools inside the admin panel:

- **Exposure Fairness Tracking (Section III-C)**: We implemented real-time monitoring of how the recommendation engine distributes traffic to cold vs. warm workers. We mirrored the exact ratio formula from the paper (`Exposure Share / Pool Share`), exposing this data visually via an `ExposureFairnessChart` (matching Figure 4). This allows us to track algorithmic bias as it happens.
- **Cold-Start Reliability Tracking**: We built an analytics module that partitions recommendations by `isColdStart` and tracks the average booked-rank position. This provides a live proxy for the NDCG@5 metrics (Table II), actively tracking the performance penalty of cold-start recommendations vs. collaborative ones.
- **Unit Testing Analytical Queries**: We hardened our `ExposureFairness` and `ColdStartBreakdown` queries using deterministic, fixture-based tests to eliminate off-by-one errors in our ratio denominators.
- **Metrics Honesty Banner**: We explicitly implemented an 'Honesty Banner' on the dashboard. This design decision was made to strictly delineate between our *live behavioral proxies* (e.g. booked-rank position, exposure ratios) and the paper's *offline synthetic metrics* (Precision, Recall, NDCG). Because we do not have a human-graded ground truth in production, it is vital that future contributors do not conflate the live analytics with offline rigor. This banner ensures structural honesty is built directly into the UI.

## Day 8 - Automated Reproducibility Harness

In the final phase of this transition, we built a fully automated reproducibility harness that executes the paper's benchmarks directly against our production code, ensuring the shipped product remains mathematically faithful to the academic claims.

- **Synthetic Benchmark**: We ported the paper's original benchmark generation into `scripts/eval/generateSyntheticBenchmark.ts`.
- **Baseline Evaluations**: We ported the Precision, Recall, and NDCG metrics, and evaluated them using the *exact* scoring algorithms served to real users (`hybridScore.ts`).
- **Ablation & Significance**: We successfully reproduced the ablation study (Table III) and authored a zero-dependency Wilcoxon signed-rank test (`scripts/eval/wilcoxon.ts`) to automate the statistical significance tests.
- **Continuous Integration Guard**: We combined all of this into a single command (`npm run eval:full`) and bound it to a GitHub Actions CI workflow. This workflow fails if the Hybrid model's NDCG@5 drops below our checked-in threshold (0.4300), structurally guaranteeing that future pull requests will not silently degrade algorithmic quality.

For exact steps on how to reproduce the academic tables and output files, see our [Reproducing Paper Results guide](reproducing-paper-results.md).
