import { z } from "zod";
import { Timestamp, GeoPoint } from "firebase/firestore";

export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
] as const;
export type EmploymentType = (typeof employmentTypes)[number];

export const jobCategories = [
  "tech",
  "healthcare",
  "finance",
  "education",
  "marketing",
  "sales",
  "design",
  "engineering",
  "customer-service",
  "other",
] as const;
export type JobCategory = (typeof jobCategories)[number];

export const experienceLevels = [
  "Entry-Level",
  "Mid-Level",
  "Senior",
  "Executive",
] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export const firebaseJobSchema = z.object({
  job_id: z.string(),
  job_title: z.string().min(3, "Title must be at least 3 characters"),
  employer_name: z
    .string()
    .min(2, "Company name must be at least 2 characters"),
  job_city: z.string(),
  job_country: z.string(),
  job_description: z
    .string()
    .min(50, "Description must be at least 50 characters"),
  job_employment_type: z.enum(employmentTypes),
  job_category_id: z.enum(jobCategories),
  job_experience_level: z.enum(experienceLevels),
  salary_min: z.number().min(0, "Minimum salary must be positive"),
  salary_max: z.number().min(0, "Maximum salary must be positive"),
  salary_currency: z.string(),
  job_highlights: z.object({
    Qualifications: z
      .array(z.string())
      .min(1, "At least one qualification is needed"),
    Responsibilities: z
      .array(z.string())
      .min(1, "At least one responsibility is needed"),
    Benefits: z.array(z.string()).optional(),
  }),
  job_is_remote: z.boolean(),
  job_apply_link: z.string().url("Must be a valid URL"),
  job_google_link: z.string().url("Must be a valid URL").optional(),
  employer_logo: z.string().optional(),
  expiry_date: z.instanceof(Timestamp),
  posted_at: z.instanceof(Timestamp),
  job_publisher: z.string(),
  applications: z.number().default(0),
  job_views: z.number().default(0),
  popularity: z.number().default(0),
  isPopular: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  location_coordinates: z.instanceof(GeoPoint).optional(),
});

export type FirebaseJob = z.infer<typeof firebaseJobSchema>;

// For backward compatibility
export const jobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.enum(employmentTypes),
  category: z.enum(jobCategories),
  salaryMin: z.number().min(0, "Minimum salary must be positive"),
  salaryMax: z.number().min(0, "Maximum salary must be positive"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z
    .array(z.string())
    .min(1, "At least one requirement is needed"),
  responsibilities: z
    .array(z.string())
    .min(1, "At least one responsibility is needed"),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.date(),
  companyLogo: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  modificationHistory: z.array(
    z.object({
      id: z.string().uuid(),
      timestamp: z.date(),
      userId: z.string(),
      userName: z.string(),
      changes: z.record(z.string()),
    })
  ),
});

export type Job = z.infer<typeof jobSchema>;

export interface JobFilters {
  category?: string;
  type?: EmploymentType;
  location?: string;
  experienceLevel?: ExperienceLevel;
  salaryRange?: {
    min: number;
    max: number;
  };
  isRemote?: boolean;
  datePosted?: Date;
  isPopular?: boolean;
  tag?: string;
}

export interface JobFormData {
  job_title: string;
  employer_name: string;
  job_city: string;
  job_country: string;
  job_is_remote: boolean;
  job_employment_type: EmploymentType;
  job_category_id: string;
  job_experience_level: ExperienceLevel;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  job_description: string;
  qualifications: string[];
  responsibilities: string[];
  benefits: string[];
  expiry_date: Date;
  job_apply_link: string;
  job_google_link?: string;
  employer_logo?: File | string;
  tags: string[];
  job_publisher: string;
}
