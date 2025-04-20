import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getJobs,
  deleteJob as deleteFirebaseJob,
} from "../../services/jobService";
import { FirebaseJob } from "../../types/job";
import { Timestamp } from "firebase/firestore";
import { formatDate, getRelativeTimeString } from "../../utils/dateUtils";

interface JobListProps {}

const JobList: React.FC<JobListProps> = () => {
  const { isAdmin } = useAuth();
  const [jobs, setJobs] = useState<FirebaseJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [sortKey, setSortKey] = useState("posted_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  // Dropdown open state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Pagination state
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(10);

  // Fetch jobs from Firebase
  useEffect(() => {
    fetchJobs();
  }, [filterType, filterStatus, filterFeatured]);

  const fetchJobs = async (loadMore = false) => {
    try {
      setLoading(true);

      // Create filter object based on current filter states
      const filters: any = {};

      if (filterType !== "all") {
        filters.type = filterType;
      }

      if (filterStatus !== "all") {
        if (filterStatus === "active") {
          // For active jobs, we check if expiry_date is in the future
          filters.isActive = true;
        } else if (filterStatus === "expired") {
          filters.isExpired = true;
        }
      }

      if (filterFeatured) {
        filters.isPopular = true;
      }

      const lastDoc = loadMore ? lastVisible : null;
      const result = await getJobs(filters, pageSize, lastDoc);

      if (result) {
        if (loadMore) {
          setJobs([...jobs, ...result.jobs]);
        } else {
          setJobs(result.jobs);
        }

        setLastVisible(result.lastVisible);
        setHasMore(result.jobs.length === pageSize);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const statusBtn = document.getElementById("status-filter-btn");
      const statusMenu = document.getElementById("status-filter-menu");
      const typeBtn = document.getElementById("type-filter-btn");
      const typeMenu = document.getElementById("type-filter-menu");
      if (
        statusDropdownOpen &&
        statusBtn &&
        statusMenu &&
        !statusBtn.contains(e.target as Node) &&
        !statusMenu.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
      if (
        typeDropdownOpen &&
        typeBtn &&
        typeMenu &&
        !typeBtn.contains(e.target as Node) &&
        !typeMenu.contains(e.target as Node)
      ) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [statusDropdownOpen, typeDropdownOpen]);

  // Close action menu on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const menus = document.querySelectorAll("[data-job-action-menu]");
      const buttons = document.querySelectorAll("[data-job-action-btn]");
      let clickedInside = false;
      menus.forEach((menu) => {
        if (menu.contains(e.target as Node)) clickedInside = true;
      });
      buttons.forEach((btn) => {
        if (btn.contains(e.target as Node)) clickedInside = true;
      });
      if (!clickedInside) setOpenActionMenu(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobs(filteredJobs.map((job) => job.job_id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (id: string) => {
    if (selectedJobs.includes(id)) {
      setSelectedJobs(selectedJobs.filter((jobId) => jobId !== id));
    } else {
      setSelectedJobs([...selectedJobs, id]);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteFirebaseJob(id);
        setJobs(jobs.filter((job) => job.job_id !== id));
        setSelectedJobs(selectedJobs.filter((jobId) => jobId !== id));
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Please try again.");
      }
    }
  };

  const deleteSelectedJobs = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedJobs.length} selected jobs?`
      )
    ) {
      try {
        // Delete jobs one by one
        const deletePromises = selectedJobs.map((jobId) =>
          deleteFirebaseJob(jobId)
        );
        await Promise.all(deletePromises);

        setJobs(jobs.filter((job) => !selectedJobs.includes(job.job_id)));
        setSelectedJobs([]);
      } catch (error) {
        console.error("Error deleting jobs:", error);
        alert("Failed to delete some jobs. Please try again.");
      }
    }
  };

  // Determine if a job is expired
  const isJobExpired = (job: FirebaseJob) => {
    if (!job.expiry_date) return false;
    const now = new Date();
    return job.expiry_date.toDate() < now;
  };

  // Determine job status
  const getJobStatus = (job: FirebaseJob) => {
    if (isJobExpired(job)) return "expired";
    return "active";
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getJobStatus(job);
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    const matchesType =
      filterType === "all" || job.job_employment_type === filterType;
    const matchesFeatured = !filterFeatured || job.isPopular;

    return matchesSearch && matchesStatus && matchesType && matchesFeatured;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortKey === "applications") {
      return sortDirection === "asc"
        ? (a.applications || 0) - (b.applications || 0)
        : (b.applications || 0) - (a.applications || 0);
    }

    if (sortKey === "posted_at") {
      // Handle null posted dates
      if (!a.posted_at) return sortDirection === "asc" ? -1 : 1;
      if (!b.posted_at) return sortDirection === "asc" ? 1 : -1;

      return sortDirection === "asc"
        ? a.posted_at.toMillis() - b.posted_at.toMillis()
        : b.posted_at.toMillis() - a.posted_at.toMillis();
    }

    if (sortKey === "job_title") {
      return sortDirection === "asc"
        ? a.job_title.localeCompare(b.job_title)
        : b.job_title.localeCompare(a.job_title);
    }

    if (sortKey === "employer_name") {
      return sortDirection === "asc"
        ? a.employer_name.localeCompare(b.employer_name)
        : b.employer_name.localeCompare(a.employer_name);
    }

    return 0;
  });

  // Get status badge element
  const getStatusBadge = (job: FirebaseJob) => {
    const status = getJobStatus(job);

    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-900/30 dark:text-success-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-800 dark:bg-error-900/30 dark:text-error-300">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Job Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Create, edit and manage job listings
          </p>
        </motion.div>

        {isAdmin && (
          <motion.div
            className="mt-4 flex space-x-2 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/jobs/new-job"
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New Job</span>
            </Link>
          </motion.div>
        )}
      </div>

      <motion.div
        className="rounded-lg bg-white shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="border-b border-neutral-200 p-4 dark:border-neutral-700">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-400"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  id="status-filter-btn"
                  type="button"
                  className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <Filter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Status: {filterStatus === "all" ? "All" : filterStatus}
                  <ChevronDown className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {statusDropdownOpen && (
                  <div
                    id="status-filter-menu"
                    className="absolute right-0 mt-2 w-36 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterStatus("all");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("active");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Active
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("expired");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Expired
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  id="type-filter-btn"
                  type="button"
                  className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                >
                  <Filter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Type: {filterType === "all" ? "All" : filterType}
                  <ChevronDown className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {typeDropdownOpen && (
                  <div
                    id="type-filter-menu"
                    className="absolute right-0 mt-2 w-36 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterType("all");
                          setTypeDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setFilterType("Full-time");
                          setTypeDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Full-time
                      </button>
                      <button
                        onClick={() => {
                          setFilterType("Part-time");
                          setTypeDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Part-time
                      </button>
                      <button
                        onClick={() => {
                          setFilterType("Contract");
                          setTypeDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Contract
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFilterFeatured(!filterFeatured)}
                className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium ${
                  filterFeatured
                    ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Popular Only
              </button>
            </div>
          </div>
        </div>

        {selectedJobs.length > 0 && (
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900/50">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedJobs.length} items selected
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-error-50 px-3 py-1 text-xs font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/30"
                onClick={deleteSelectedJobs}
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading && !jobs.length ? (
            <div className="flex h-64 items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-primary-600" />
              <span className="ml-2 text-lg">Loading jobs...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 rounded-full bg-error-100 p-3 dark:bg-error-900/30">
                <XCircle className="h-6 w-6 text-error-600 dark:text-error-400" />
              </div>
              <h3 className="mb-1 text-base font-medium text-error-600 dark:text-error-400">
                {error}
              </h3>
              <button
                onClick={() => fetchJobs()}
                className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <table className="w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                        onChange={handleSelectAll}
                        checked={
                          selectedJobs.length === filteredJobs.length &&
                          filteredJobs.length > 0
                        }
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("job_title")}
                    >
                      Job Title
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("applications")}
                    >
                      Applications
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
                {sortedJobs.length > 0 ? (
                  sortedJobs.map((job) => (
                    <tr
                      key={job.job_id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                            checked={selectedJobs.includes(job.job_id)}
                            onChange={() => handleSelectJob(job.job_id)}
                          />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {job.employer_logo ? (
                              <img
                                src={job.employer_logo}
                                alt={job.employer_name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                <Briefcase className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {job.job_title}
                            </div>
                            {job.isPopular && (
                              <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          {job.job_is_remote ? (
                            <div className="flex items-center">
                              <Globe className="mr-1 h-3 w-3" />
                              Remote
                            </div>
                          ) : (
                            `${job.job_city}, ${job.job_country}`
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {job.job_employment_type}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(job)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {job.applications || 0}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              className="flex items-center rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                              data-job-action-btn
                              onClick={() =>
                                setOpenActionMenu(
                                  openActionMenu === job.job_id
                                    ? null
                                    : job.job_id
                                )
                              }
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            {openActionMenu === job.job_id && (
                              <div
                                className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800"
                                data-job-action-menu
                              >
                                <div className="py-1">
                                  <Link
                                    to={`/jobs/${job.job_id}`}
                                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                  >
                                    <Eye className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                    View
                                  </Link>
                                  {isAdmin && (
                                    <>
                                      <Link
                                        to={`/jobs/edit/${job.job_id}`}
                                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                      >
                                        <Edit className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() =>
                                          handleDeleteJob(job.job_id)
                                        }
                                        className="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-neutral-100 dark:text-error-400 dark:hover:bg-neutral-700"
                                      >
                                        <Trash className="mr-3 h-4 w-4" />
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-700">
                          <Briefcase className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                        </div>
                        <h3 className="mb-1 text-base font-medium text-neutral-900 dark:text-white">
                          No jobs found
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {searchTerm
                            ? "Try adjusting your search or filters"
                            : "Create your first job posting"}
                        </p>
                        {isAdmin && !searchTerm && (
                          <Link
                            to="/jobs/new-job"
                            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            New Job
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="mb-4 flex items-center text-sm text-neutral-500 dark:text-neutral-400 sm:mb-0">
              Showing{" "}
              <span className="mx-1 font-medium text-neutral-900 dark:text-white">
                {sortedJobs.length}
              </span>{" "}
              of{" "}
              <span className="mx-1 font-medium text-neutral-900 dark:text-white">
                {jobs.length}
              </span>{" "}
              jobs
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={!lastVisible}
                onClick={() => fetchJobs()}
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={!hasMore}
                onClick={() => fetchJobs(true)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JobList;
