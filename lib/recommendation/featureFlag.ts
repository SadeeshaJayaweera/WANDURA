import { ModelVariant } from "../../types/recommendation";

const ALLOWED_VARIANTS: ModelVariant[] = [
  "hybrid",
  "rule_based",
  "content_based",
  "collaborative",
];

/**
 * Returns the currently active recommendation model variant from the environment flag.
 * Provides validation to ensure the variant is supported, defaulting to "hybrid"
 * if the flag is missing or invalid.
 */
export function getActiveModelVariant(): ModelVariant {
  const envVariant = process.env.RECOMMENDATION_MODEL;

  if (envVariant && ALLOWED_VARIANTS.includes(envVariant as ModelVariant)) {
    return envVariant as ModelVariant;
  }

  // Fallback default
  return "hybrid";
}
