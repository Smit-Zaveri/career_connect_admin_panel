import { z } from "zod";

// List of available specializations
export const specializations = [
  "Career Guidance",
  "Resume Building",
  "Interview Coaching",
  "Job Search Strategy",
  "Career Transition",
  "Professional Development",
  "Freelancing",
  "Leadership Development",
  "Technical Skills",
  "Soft Skills",
  "Entrepreneurship",
  "Industry Specific",
  "Education Planning",
  "Internship Guidance",
];

// Counselor status types
export type CounselorStatus = "active" | "inactive" | "pending" | "rejected";

// Single availability day schema
const availabilityDaySchema = z.object({
  day: z.string().min(1, "Day is required"),
  slots: z.array(z.string()).min(1, "At least one time slot is required"),
});

// Main counselor form schema with validation rules
export const counselorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required for login"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  specialization: z.string().min(1, "Specialization is required"),
  about: z.string().min(20, "About section must be at least 20 characters"),
  experience: z.number().min(0, "Experience cannot be negative"),
  expertise: z
    .array(z.string())
    .min(1, "At least one expertise area is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  status: z.enum(["active", "inactive", "pending", "rejected"]),
  photoURL: z.any().optional(),
  availability: z
    .array(availabilityDaySchema)
    .min(1, "At least one day of availability is required"),
  rating: z.number().min(0).max(5).optional(),
  sessionCount: z.number().min(0).optional(),
});

// Type for form data
export type CounselorFormData = z.infer<typeof counselorFormSchema>;

// Base counselor interface
export interface Counselor {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional in interface but will be stored
  phone?: string;
  specialization: string;
  about: string;
  experience: number;
  expertise: string[];
  languages: string[];
  photoURL?: string;
  status: CounselorStatus;
  rating: number;
  sessionCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  availability: {
    day: string;
    slots: string[];
  }[];
}

// Type for the availability session
export interface AvailabilitySession {
  id: string;
  counselorId: string;
  day: string;
  time: string;
  status: "available" | "booked" | "completed" | "canceled";
  userId?: string;
  userName?: string;
  createdAt: Date;
}

// Type for counselor reviews
export interface CounselorReview {
  id: string;
  counselorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
