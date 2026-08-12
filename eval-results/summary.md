# Recommendation Engine Evaluation Summary

## Table I: Baseline Comparisons (K=5)
| Model | NDCG@5 | Precision@5 | Recall@5 |
|-------|--------|-------------|----------|
| RULEBASED | 0.1469 | 0.1187 | 0.1978 |
| CONTENTBASED | 0.2078 | 0.1813 | 0.3022 |
| COLLABORATIVE | 0.2228 | 0.1153 | 0.1922 |
| HYBRID | 0.4362 | 0.2813 | 0.4689 |

## Significance Testing (Hybrid vs Baselines)
*Wilcoxon signed-rank test on paired NDCG@5 scores.*

| Baseline | W-statistic | p-value | Significant (p<0.05) |
|----------|-------------|---------|----------------------|
| RULEBASED | 3868 | 0.0000e+0 | Yes |
| CONTENTBASED | 5331.5 | 0.0000e+0 | Yes |
| COLLABORATIVE | 4896 | 0.0000e+0 | Yes |

## Table III: Ablation Study (NDCG@5)
| Variant | NDCG@5 | Δ vs Full Hybrid |
|---------|--------|------------------|
| Full Hybrid | 0.4362 | Baseline |
| No proximityWeight | 0.3267 | -0.1095 |
| No priceWeight | 0.4263 | -0.0099 |
| No ratingWeight | 0.4273 | -0.0089 |
| No tagWeight | 0.3700 | -0.0662 |
| No collabWeight | 0.3551 | -0.0811 |

