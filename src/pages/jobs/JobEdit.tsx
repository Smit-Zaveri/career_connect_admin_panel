import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Loader } from "lucide-react";
import JobForm from "../../components/jobs/JobForm";
import { JobFormData, FirebaseJob } from "../../types/job";
import { useAuth } from "../../context/AuthContext";
import { getJobById, updateJob } from "../../services/jobService";

const JobEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [job, setJob] = useState<FirebaseJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setError("Job ID not provided");
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const jobData = await getJobById(id);
        setJob(jobData);
        setError(null);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again later.");
        setJob(null);
      } finally {
        setIsFetching(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmit = async (data: JobFormData) => {
    if (!id) {
      setError("Job ID not provided");
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty values from arrays
      const cleanData = {
        ...data,
        qualifications:
          data.qualifications?.filter((q) => q.trim() !== "") || [],
        responsibilities:
          data.responsibilities?.filter((r) => r.trim() !== "") || [],
        benefits: data.benefits?.filter((b) => b.trim() !== "") || [],
        tags: data.tags?.filter((t) => t.trim() !== "") || [],
      };

      await updateJob(id, cleanData);
      navigate("/jobs");
    } catch (err) {
      console.error("Error updating job:", err);
      // Error is handled in the JobForm component
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  const mapFirebaseJobToFormData = (job: FirebaseJob): Partial<JobFormData> => {
    return {
      job_title: job.job_title,
      employer_name: job.employer_name,
      job_city: job.job_city,
      job_country: job.job_country,
      job_description: job.job_description,
      job_employment_type: job.job_employment_type,
      job_category_id: job.job_category_id,
      job_experience_level: job.job_experience_level,
      job_is_remote: job.job_is_remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: job.salary_currency,
      qualifications: job.job_highlights?.Qualifications || [],
      responsibilities: job.job_highlights?.Responsibilities || [],
      benefits: job.job_highlights?.Benefits || [],
      expiry_date: job.expiry_date?.toDate(),
      job_apply_link: job.job_apply_link,
      job_google_link: job.job_google_link,
      employer_logo: job.employer_logo,
      tags: job.tags || [],
      job_publisher: job.job_publisher,
      isPopular: job.isPopular,
    };
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading job data...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-lg bg-error-50 p-6 text-center dark:bg-error-900/30">
        <h2 className="text-xl font-semibold text-error-800 dark:text-error-200">
          {error || "Job not found"}
        </h2>
        <p className="mt-2 text-error-600 dark:text-error-300">
          Could not load the job data. Please try again later.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="mt-4 inline-block rounded-md bg-white px-4 py-2 font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <button
            onClick={() => navigate("/jobs")}
            className="mr-4 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Edit Job
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Update job posting details
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
        </motion.div>
      </div>

      <motion.div
        className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <JobForm
          initialData={mapFirebaseJobToFormData(job)}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/jobs")}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
};

export default JobEdit;
