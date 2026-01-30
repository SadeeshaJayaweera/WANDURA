export interface WorkerSearchFilters {
  skill?: string
  city?: string
  minRate?: number
  maxRate?: number
  minRating?: number
  isAvailable?: boolean
  latitude?: number
  longitude?: number
  radius?: number
}

export interface ProductSearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  storeId?: string
  isAvailable?: boolean
}

export interface EstimateItem {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export interface DashboardStats {
  totalBookings?: number
  activeProjects?: number
  totalEarnings?: number
  pendingBookings?: number
  completedJobs?: number
  averageRating?: number
}
