export interface RecommendationEventPayload {
  recommendationLogId: string;
  rank: number;
  modelVariant: string;
  action: 'view' | 'book';
}

/**
 * Fires a lightweight telemetry event to track user interactions with ML recommendations.
 * Useful for building ground-truth datasets for A/B testing or model retraining.
 */
export function trackRecommendationClick(payload: RecommendationEventPayload) {
  // In a real implementation, this would send an HTTP POST to an analytics provider 
  // (e.g., Mixpanel, Segment, or a custom telemetry endpoint).
  // For now, we log it clearly to the console to verify wiring.
  console.log('[Analytics] Recommendation Interaction:', payload);
}
