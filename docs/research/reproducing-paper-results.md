# Reproducing Paper Results

This repository contains a full suite of deterministic benchmarking scripts that mirror the evaluation procedures described in our original academic paper. Because our production code (`lib/recommendation/**`) powers these benchmarks, running them proves that the live system achieves the exact statistical rigor and ranking quality reported.

## How to Run the Evaluation Suite

You can execute the entire evaluation pipeline with a single command from the project root:

```bash
npm run eval:full
```

### What this command does:
1. **Generates Synthetic Benchmark (`eval-data/workers.json`, `eval-data/requests.json`)**: Creates a seeded random dataset of 300 customers and 300 workers, simulating interaction profiles and querying a hidden multinomial-logit utility function.
2. **Evaluates Baselines (`eval-results/baselines.json`)**: Executes the Rule-based, Content-based, Collaborative, and Hybrid recommendation engines against the synthetic benchmark, computing Precision@K, Recall@K, and NDCG@K.
3. **Executes Ablation Study (`eval-results/ablation.json`)**: Iteratively drops individual signal weights (Proximity, Price, Rating, Tag, Collaborative), renormalizes the remaining weights to 1.0, and computes NDCG@5 to quantify each signal's contribution.
4. **Calculates Statistical Significance (`eval-results/significance.json`)**: Runs a Wilcoxon signed-rank test on the paired NDCG@5 scores to confirm the Hybrid model's superiority is statistically significant ($p < 0.05$).
5. **Generates Markdown Summary (`eval-results/summary.md`)**: Aggregates the JSON results into a human-readable markdown file.

## Mapping Repo Output to Paper Sections

| Paper Reference | Output File | Description |
|-----------------|-------------|-------------|
| **Table I** (Baseline Eval) | `eval-results/baselines.json` | Shows Hybrid NDCG@5 outperforming all baseline models. |
| **Table III** (Ablation) | `eval-results/ablation.json` | Shows relative NDCG drops for `No proximityWeight`, `No collabWeight`, etc. |
| **Significance Testing** | `eval-results/significance.json` | Contains Wilcoxon W-statistics and exact $p$-values. |

## Automated Regression Guards
The repository includes a GitHub Actions workflow (`.github/workflows/recommendation-eval.yml`). If any future Pull Request modifies the recommendation engine (`lib/recommendation/**`) in a way that drops the Hybrid NDCG@5 below our defined threshold (`eval-results/baseline-threshold.json`), the CI build will fail. This prevents silent regressions in ranking quality.
