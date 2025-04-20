import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import JobForm from "../../components/jobs/JobForm";
import { JobFormData } from "../../types/job";
import { useAuth } from "../../context/AuthContext";
import { createJob } from "../../services/jobService";

const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: JobFormData) => {
    try {
      setIsLoading(true);

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

      // Create job in Firebase
      const result = await createJob(cleanData);
      console.log("Job created with ID:", result.job_id);

      // Redirect to job listing page
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      // Note: Error handling is done in the JobForm component via the thrown error
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    navigate("/dashboard");
    return null;
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
              Create New Job
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Add a new job posting to the platform
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <JobForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/jobs")}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
};

export default JobCreate;
