import { WorkerProfile, SkillType } from '@prisma/client'

export interface ScoreBreakdown {
  proximity: number
  price: number
  rating: number
  tag: number
  collab: number
}

export interface RankedWorker extends WorkerProfile {
  score: number
  rank: number
  scoreBreakdown: ScoreBreakdown
  // Optional user details usually included in API responses
  user?: {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
  }
}

export interface RecommendationRequest {
  requestId?: string
  skill: SkillType
  lat: number
  lng: number
  budget: number
  customerId: string
}

export type ModelVariant = 'hybrid' | 'rule_based' | 'content_based' | 'collaborative'
