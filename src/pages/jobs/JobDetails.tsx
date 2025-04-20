import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  ArrowLeft,
  Edit,
  Share2,
  Users,
  Tag,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  Loader,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getJobById, trackJobApplication } from "../../services/jobService";
import { FirebaseJob } from "../../types/job";
import { Timestamp } from "firebase/firestore";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

const formatSalary = (min: number, max: number, currency: string) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

// Sample applications data - in a real app, this would come from Firebase as well
const sampleApplicationsData = [
  { date: "2023-10-13", count: 5 },
  { date: "2023-10-14", count: 12 },
  { date: "2023-10-15", count: 7 },
  { date: "2023-10-16", count: 4 },
];

const JobDetails: React.FC = () => {
  const { isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<FirebaseJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const jobData = await getJobById(id);
        setJob(jobData);
        setError(null);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApplyClick = async () => {
    if (!id) return;
    try {
      await trackJobApplication(id);
      alert("Application tracked!");
    } catch (err) {
      console.error("Error tracking application:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading job details...</span>
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
          {!error &&
            "The job listing you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/jobs"
          className="mt-4 inline-block rounded-md bg-white px-4 py-2 font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <Link
            to="/jobs"
            className="mr-4 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {job.job_title}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {job.employer_name} • {job.job_city}, {job.job_country}
            </p>
          </div>
        </motion.div>

        {isAdmin && (
          <motion.div
            className="mt-4 flex space-x-2 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share</span>
            </button>
            <Link
              to={`/jobs/edit/${job.job_id}`}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Job</span>
            </Link>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Job Details
              </h2>
              <div className="flex items-center space-x-2">
                {job.job_is_remote && (
                  <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-900/30 dark:text-success-300">
                    <Globe className="mr-1 h-3 w-3" />
                    Remote
                  </span>
                )}
                {job.isPopular && (
                  <span className="inline-flex items-center rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
                    Popular
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Type
                </span>
                <div className="mt-1 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                  <Clock className="mr-1 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  {job.job_employment_type}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Location
                </span>
                <div className="mt-1 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                  <MapPin className="mr-1 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  {job.job_city}, {job.job_country}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Experience
                </span>
                <div className="mt-1 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                  <Briefcase className="mr-1 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  {job.job_experience_level}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Salary
                </span>
                <div className="mt-1 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                  <DollarSign className="mr-1 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  {formatSalary(
                    job.salary_min,
                    job.salary_max,
                    job.salary_currency
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-base font-medium text-neutral-900 dark:text-white">
                Description
              </h3>
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                {job.job_description}
              </div>
            </div>

            {job.job_highlights && (
              <>
                {job.job_highlights.Responsibilities &&
                  job.job_highlights.Responsibilities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-base font-medium text-neutral-900 dark:text-white">
                        Responsibilities
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                        {job.job_highlights.Responsibilities.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {job.job_highlights.Qualifications &&
                  job.job_highlights.Qualifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-base font-medium text-neutral-900 dark:text-white">
                        Qualifications
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                        {job.job_highlights.Qualifications.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {job.job_highlights.Benefits &&
                  job.job_highlights.Benefits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-base font-medium text-neutral-900 dark:text-white">
                        Benefits
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
                        {job.job_highlights.Benefits.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            )}

            {job.tags && job.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-base font-medium text-neutral-900 dark:text-white">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <a
                  href={job.job_apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleApplyClick}
                  className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apply Now
                </a>

                {job.job_google_link && (
                  <a
                    href={job.job_google_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    View on Google
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
              <h3 className="text-base font-medium text-neutral-900 dark:text-white">
                Applications
              </h3>
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {job.applications}
                </div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Total applications
                </div>
              </div>
              <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                    Recent Applications
                  </h4>
                  <Link
                    to="#"
                    className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {sampleApplicationsData.map((item) => (
                    <div
                      key={item.date}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(new Date(item.date))}
                      </div>
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {Array.from({ length: Math.min(3, item.count) }).map(
                            (_, i) => (
                              <div
                                key={i}
                                className="inline-block h-6 w-6 overflow-hidden rounded-full ring-2 ring-white dark:ring-neutral-800"
                              >
                                <img
                                  src={`https://i.pravatar.cc/100?img=${
                                    i + 10
                                  }`}
                                  alt="Applicant"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )
                          )}
                        </div>
                        {item.count > 3 && (
                          <div className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                            +{item.count - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
              <h3 className="text-base font-medium text-neutral-900 dark:text-white">
                Job Information
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Views
                    </span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {job.job_views}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Posted Date
                    </span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {job.posted_at
                      ? formatDate(job.posted_at.toDate())
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Expiry Date
                    </span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {job.expiry_date
                      ? formatDate(job.expiry_date.toDate())
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Publisher
                    </span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {job.job_publisher}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
                <h3 className="text-base font-medium text-neutral-900 dark:text-white">
                  Admin Actions
                </h3>
                <div className="mt-4 space-y-3">
                  <button className="w-full rounded-md bg-primary-50 py-2 text-center text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50">
                    {job.isPopular ? "Remove Popular Flag" : "Mark as Popular"}
                  </button>
                  <button className="w-full rounded-md bg-warning-50 py-2 text-center text-sm font-medium text-warning-700 hover:bg-warning-100 dark:bg-warning-900/30 dark:text-warning-400 dark:hover:bg-warning-900/50">
                    Extend Expiry Date
                  </button>
                  <button className="w-full rounded-md bg-error-50 py-2 text-center text-sm font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/30 dark:text-error-400 dark:hover:bg-error-900/50">
                    Delete Job Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;
