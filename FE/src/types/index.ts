export interface Job {
  id: string
  title: string
  titleEn?: string
  company: string
  logo: string
  logoBg: string
  salary: string
  location: string
  locationEn?: string
  tags: string[]
  type: 'featured' | 'vip' | 'headhunter'
  description: string
  descriptionEn?: string
  requirements: string[]
  requirementsEn?: string[]
  benefits: string[]
  benefitsEn?: string[]
  postedAt: string
  skills: string[]
}

export interface Recruiter {
  id: string
  name: string
  logo: string
  industry: string
}

export interface HandbookArticle {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  readTime: string
}

export interface JobCategory {
  id: string
  name: string
  nameEn?: string
  count: number
}

export * from './cv'
export * from './job'
export * from './recommendation'
export * from './application'

