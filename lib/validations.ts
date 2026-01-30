import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'WORKER', 'HARDWARE_STORE']),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const workerProfileSchema = z.object({
  skill: z.enum(['MASON', 'TILE_LAYER', 'WELDER', 'STEEL_FIXER', 'CARPENTER', 'PLUMBER', 'ELECTRICIAN', 'PAINTER']),
  dailyRate: z.number().min(1, 'Daily rate must be greater than 0'),
  hourlyRate: z.number().min(1, 'Hourly rate must be greater than 0').optional(),
  experience: z.number().min(0, 'Experience cannot be negative'),
  bio: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
})

export const storeProfileSchema = z.object({
  storeName: z.string().min(2, 'Store name is required'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  phone: z.string().min(10, 'Phone number is required'),
})

export const bookingSchema = z.object({
  workerId: z.string(),
  skill: z.enum(['MASON', 'TILE_LAYER', 'WELDER', 'STEEL_FIXER', 'CARPENTER', 'PLUMBER', 'ELECTRICIAN', 'PAINTER']),
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number().min(1).optional(),
  totalHours: z.number().min(1).optional(),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
})

export const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  budget: z.number().min(0).optional(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type WorkerProfileInput = z.infer<typeof workerProfileSchema>
export type StoreProfileInput = z.infer<typeof storeProfileSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
