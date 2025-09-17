export interface Testimonial {
  id: string
  name: string
  profession: string
  testimonial: string
  image_url: string | null
  linkedin_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface TestimonialFormData {
  name: string
  profession: string
  testimonial: string
  image_url: string
  linkedin_url?: string
  is_active: boolean
  display_order: number
}
