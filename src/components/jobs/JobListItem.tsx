import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Eye,
  Edit,
  Trash,
  MoreHorizontal,
} from "lucide-react";
import { Job } from "../../types/job";
import { useAuth } from "../../context/AuthContext";
import { formatDate, getRelativeTimeString } from "../../utils/dateUtils";

interface JobListItemProps {
  job: Job;
  onDelete: (id: string) => void;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, onDelete }) => {
  const { isAdmin } = useAuth();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-neutral-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 flex-shrink-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <Briefcase className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {job.company}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {job.featured && (
            <span className="inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-900/30 dark:text-warning-300">
              <Star className="mr-1 h-3 w-3" />
              Featured
            </span>
          )}
          <div className="relative">
            <button className="flex items-center rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800">
              <div className="py-1">
                <Link
                  to={`/jobs/${job.id}`}
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <Eye className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  View
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to={`/jobs/edit/${job.id}`}
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      <Edit className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(job.id)}
                      className="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-neutral-100 dark:text-error-400 dark:hover:bg-neutral-700"
                    >
                      <Trash className="mr-3 h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
          <MapPin className="mr-1.5 h-4 w-4" />
          {job.location}
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="mr-1 h-3 w-3" />
          {job.createdAt
            ? formatDate(new Date(job.createdAt))
            : "No date available"}
        </div>
        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
          <DollarSign className="mr-1.5 h-4 w-4" />
          {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
          <Calendar className="mr-1.5 h-4 w-4" />
          {formatDate(new Date(job.applicationDeadline))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.requirements.slice(0, 3).map((requirement, index) => (
          <span
            key={index}
            className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
          >
            {requirement}
          </span>
        ))}
        {job.requirements.length > 3 && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            +{job.requirements.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default JobListItem;
