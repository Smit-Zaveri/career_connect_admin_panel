import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  Timestamp,
  GeoPoint,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { FirebaseJob, JobFormData } from "../types/job";

const JOBS_COLLECTION = "jobs";

// Convert Firebase job to application job
export const convertFirebaseJob = (doc: any): FirebaseJob => {
  const data = doc.data();
  return {
    ...data,
    job_id: doc.id,
  };
};

// Get all jobs with optional filtering
export const getJobs = async (filters?: any, pageSize = 10, lastDoc?: any) => {
  try {
    let jobsQuery = collection(db, JOBS_COLLECTION);
    let constraints: any[] = [];

    if (filters) {
      if (filters.category) {
        constraints.push(where("job_category_id", "==", filters.category));
      }
      if (filters.type) {
        constraints.push(where("job_employment_type", "==", filters.type));
      }
      if (filters.isRemote !== undefined) {
        constraints.push(where("job_is_remote", "==", filters.isRemote));
      }
      if (filters.experienceLevel) {
        constraints.push(
          where("job_experience_level", "==", filters.experienceLevel)
        );
      }
      if (filters.isPopular !== undefined) {
        constraints.push(where("isPopular", "==", filters.isPopular));
      }
      if (filters.tag) {
        constraints.push(where("tags", "array-contains", filters.tag));
      }

      // Handle active/expired job filters
      if (filters.isActive) {
        // Active jobs have expiry_date in the future or no expiry_date
        const now = Timestamp.fromDate(new Date());
        constraints.push(where("expiry_date", ">", now));
      }
      if (filters.isExpired) {
        // Expired jobs have expiry_date in the past
        const now = Timestamp.fromDate(new Date());
        constraints.push(where("expiry_date", "<=", now));
      }
    }

    // Add default sorting
    constraints.push(orderBy("posted_at", "desc"));

    // Apply pagination if lastDoc exists
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Apply page size limit
    constraints.push(limit(pageSize));

    const q = query(jobsQuery, ...constraints);
    const querySnapshot = await getDocs(q);

    const jobs: FirebaseJob[] = [];
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    querySnapshot.forEach((doc) => {
      jobs.push(convertFirebaseJob(doc));
    });

    return { jobs, lastVisible };
  } catch (error) {
    console.error("Error getting jobs:", error);
    throw error;
  }
};

// Get a single job by ID
export const getJobById = async (jobId: string) => {
  try {
    const docRef = doc(db, JOBS_COLLECTION, jobId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      try {
        // Try to increment view count but don't let it block getting the job
        await updateDoc(docRef, {
          job_views: increment(1),
        }).catch((err) => console.warn("Failed to update view count:", err));
      } catch (viewError) {
        // Log but don't fail the entire operation
        console.warn("Error updating view count:", viewError);
      }

      return convertFirebaseJob(docSnap);
    } else {
      throw new Error(`Job with ID ${jobId} not found`);
    }
  } catch (error) {
    console.error("Error getting job:", error);
    throw error;
  }
};

// Create new job
export const createJob = async (jobData: JobFormData) => {
  try {
    // Create a new doc reference with auto ID
    const newJobRef = doc(collection(db, JOBS_COLLECTION));

    // Handle logo upload if it's a File
    let logoUrl = jobData.employer_logo;
    if (jobData.employer_logo instanceof File) {
      const file = jobData.employer_logo;
      const storageRef = ref(storage, `job-logos/${newJobRef.id}/${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      logoUrl = await getDownloadURL(uploadResult.ref);
    }

    // Prepare job data with Firestore specific types
    const firebaseJobData: { [key: string]: any } = {
      job_title: jobData.job_title,
      employer_name: jobData.employer_name,
      job_city: jobData.job_city,
      job_country: jobData.job_country,
      job_description: jobData.job_description,
      job_employment_type: jobData.job_employment_type,
      job_category_id: jobData.job_category_id,
      job_experience_level: jobData.job_experience_level,
      job_is_remote: jobData.job_is_remote,
      salary_min: jobData.salary_min,
      salary_max: jobData.salary_max,
      salary_currency: jobData.salary_currency,
      job_highlights: {
        Qualifications: jobData.qualifications,
        Responsibilities: jobData.responsibilities,
        Benefits: jobData.benefits,
      },
      job_apply_link: jobData.job_apply_link,
      job_google_link: jobData.job_google_link || "",
      employer_logo: logoUrl || "",
      expiry_date: Timestamp.fromDate(jobData.expiry_date),
      posted_at: Timestamp.fromDate(new Date()),
      job_publisher: jobData.job_publisher,
      applications: 0,
      job_views: 0,
      popularity: 0,
      isPopular: false,
      tags: jobData.tags || [],
    };

    // Add location coordinates if available
    if (jobData.job_city && jobData.job_country) {
      // In a real app, you would use a geocoding service here
      // This is just a placeholder
      firebaseJobData["location_coordinates"] = new GeoPoint(0, 0);
    }

    await setDoc(newJobRef, firebaseJobData);
    return { ...firebaseJobData, job_id: newJobRef.id };
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// Update existing job
export const updateJob = async (
  jobId: string,
  jobData: Partial<JobFormData>
) => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);

    // Handle logo upload if it's a File
    if (jobData.employer_logo instanceof File) {
      const file = jobData.employer_logo;
      const storageRef = ref(storage, `job-logos/${jobId}/${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      jobData.employer_logo = await getDownloadURL(uploadResult.ref);
    }

    // Prepare update data
    const updateData: any = {};

    // Map form fields to Firebase fields
    if (jobData.job_title) updateData.job_title = jobData.job_title;
    if (jobData.employer_name) updateData.employer_name = jobData.employer_name;
    if (jobData.job_city) updateData.job_city = jobData.job_city;
    if (jobData.job_country) updateData.job_country = jobData.job_country;
    if (jobData.job_description)
      updateData.job_description = jobData.job_description;
    if (jobData.job_employment_type)
      updateData.job_employment_type = jobData.job_employment_type;
    if (jobData.job_category_id)
      updateData.job_category_id = jobData.job_category_id;
    if (jobData.job_experience_level)
      updateData.job_experience_level = jobData.job_experience_level;
    if (jobData.job_is_remote !== undefined)
      updateData.job_is_remote = jobData.job_is_remote;
    if (jobData.salary_min) updateData.salary_min = jobData.salary_min;
    if (jobData.salary_max) updateData.salary_max = jobData.salary_max;
    if (jobData.salary_currency)
      updateData.salary_currency = jobData.salary_currency;
    if (jobData.job_apply_link)
      updateData.job_apply_link = jobData.job_apply_link;
    if (jobData.job_google_link)
      updateData.job_google_link = jobData.job_google_link;
    if (jobData.employer_logo) updateData.employer_logo = jobData.employer_logo;
    if (jobData.expiry_date)
      updateData.expiry_date = Timestamp.fromDate(jobData.expiry_date);
    if (jobData.job_publisher) updateData.job_publisher = jobData.job_publisher;
    if (jobData.tags) updateData.tags = jobData.tags;

    // Update job_highlights if any of these fields are present
    if (
      jobData.qualifications ||
      jobData.responsibilities ||
      jobData.benefits
    ) {
      // Get current job highlights first
      const jobSnapshot = await getDoc(jobRef);
      const currentData = jobSnapshot.data();
      const currentHighlights = currentData?.job_highlights || {
        Qualifications: [],
        Responsibilities: [],
        Benefits: [],
      };

      updateData.job_highlights = {
        ...currentHighlights,
        ...(jobData.qualifications && {
          Qualifications: jobData.qualifications,
        }),
        ...(jobData.responsibilities && {
          Responsibilities: jobData.responsibilities,
        }),
        ...(jobData.benefits && { Benefits: jobData.benefits }),
      };
    }

    await updateDoc(jobRef, updateData);

    // Get the updated job
    const updatedJob = await getDoc(jobRef);
    return convertFirebaseJob(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

// Delete job
export const deleteJob = async (jobId: string) => {
  try {
    await deleteDoc(doc(db, JOBS_COLLECTION, jobId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

// Track job application
export const trackJobApplication = async (jobId: string) => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      applications: increment(1),
      popularity: increment(10), // Increase popularity score on application
    });
    return { success: true };
  } catch (error) {
    console.error("Error tracking job application:", error);
    throw error;
  }
};

// Search jobs by query string
export const searchJobs = async (query: string) => {
  try {
    const jobsQuery = query.toLowerCase();
    const jobsRef = collection(db, JOBS_COLLECTION);
    const snapshot = await getDocs(jobsRef);

    const jobs: FirebaseJob[] = [];

    snapshot.forEach((doc) => {
      const job = convertFirebaseJob(doc);

      // Search in job title, description, employer name, and other relevant fields
      if (
        job.job_title.toLowerCase().includes(jobsQuery) ||
        job.job_description.toLowerCase().includes(jobsQuery) ||
        job.employer_name.toLowerCase().includes(jobsQuery) ||
        (job.job_city && job.job_city.toLowerCase().includes(jobsQuery)) ||
        (job.job_country &&
          job.job_country.toLowerCase().includes(jobsQuery)) ||
        (job.tags &&
          job.tags.some((tag) => tag.toLowerCase().includes(jobsQuery)))
      ) {
        jobs.push(job);
      }
    });

    // Sort by relevance - exact matches in title first, then description
    jobs.sort((a, b) => {
      const aTitle = a.job_title.toLowerCase().includes(jobsQuery);
      const bTitle = b.job_title.toLowerCase().includes(jobsQuery);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });

    return jobs;
  } catch (error) {
    console.error("Error searching jobs:", error);
    throw error;
  }
};

export const jobService = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  trackJobApplication,
  searchJobs,
};
