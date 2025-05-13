import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ArrowUpDown,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase as BriefcaseBusiness,
  GraduationCap,
  BadgeCheck,
  Loader,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getCounselors,
  deleteCounselor,
  FirebaseCounselor,
} from "../../services/counselorService";
import { formatDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";

const CounselorList: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [counselors, setCounselors] = useState<FirebaseCounselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpecialization, setFilterSpecialization] = useState("all");
  const [filterVerified, setFilterVerified] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedCounselors, setSelectedCounselors] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [specializationDropdownOpen, setSpecializationDropdownOpen] =
    useState(false);
  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);

  // Pagination
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(10);
  const [specializations, setSpecializations] = useState<string[]>([]);

  useEffect(() => {
    fetchCounselors();
  }, [filterStatus, filterSpecialization, filterVerified]);

  const fetchCounselors = async (loadMore = false) => {
    try {
      setLoading(true);

      // Create filter object based on current filter states
      const filters: any = {};

      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      if (filterSpecialization !== "all") {
        filters.specialization = filterSpecialization;
      }

      const lastDoc = loadMore ? lastVisible : null;
      const result = await getCounselors(filters, pageSize, lastDoc);

      if (result) {
        if (loadMore) {
          setCounselors([...counselors, ...result.counselors]);
        } else {
          setCounselors(result.counselors);
        }

        setLastVisible(result.lastVisible);
        setHasMore(result.counselors.length === pageSize);

        // Extract unique specializations for the filter dropdown
        if (!loadMore) {
          const uniqueSpecializations = Array.from(
            new Set(
              result.counselors.map((counselor) => counselor.specialization)
            )
          ).filter(Boolean) as string[];
          setSpecializations(uniqueSpecializations);
        }
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching counselors:", err);
      setError("Failed to load counselors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const statusBtn = document.getElementById("status-filter-btn");
      const statusMenu = document.getElementById("status-filter-menu");
      const specializationBtn = document.getElementById(
        "specialization-filter-btn"
      );
      const specializationMenu = document.getElementById(
        "specialization-filter-menu"
      );

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
        specializationDropdownOpen &&
        specializationBtn &&
        specializationMenu &&
        !specializationBtn.contains(e.target as Node) &&
        !specializationMenu.contains(e.target as Node)
      ) {
        setSpecializationDropdownOpen(false);
      }

      // Close action dropdown when clicking outside
      if (
        activeActionDropdown &&
        !(e.target as Element).closest(".action-dropdown-container")
      ) {
        setActiveActionDropdown(null);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [statusDropdownOpen, specializationDropdownOpen, activeActionDropdown]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCounselors(
        filteredCounselors.map((counselor) => counselor.id)
      );
    } else {
      setSelectedCounselors([]);
    }
  };

  const handleSelectCounselor = (id: string) => {
    if (selectedCounselors.includes(id)) {
      setSelectedCounselors(
        selectedCounselors.filter((counselorId) => counselorId !== id)
      );
    } else {
      setSelectedCounselors([...selectedCounselors, id]);
    }
  };

  const handleDeleteCounselor = async (id: string) => {
    if (confirm("Are you sure you want to delete this counselor?")) {
      try {
        await deleteCounselor(id);
        setCounselors(counselors.filter((counselor) => counselor.id !== id));
        setSelectedCounselors(
          selectedCounselors.filter((counselorId) => counselorId !== id)
        );
        toast.success("Counselor deleted successfully");
      } catch (error) {
        console.error("Error deleting counselor:", error);
        toast.error("Failed to delete counselor");
      }
    }
  };

  const deleteSelectedCounselors = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedCounselors.length} selected counselors?`
      )
    ) {
      try {
        // Delete counselors one by one
        const deletePromises = selectedCounselors.map((counselorId) =>
          deleteCounselor(counselorId)
        );
        await Promise.all(deletePromises);

        setCounselors(
          counselors.filter(
            (counselor) => !selectedCounselors.includes(counselor.id)
          )
        );
        setSelectedCounselors([]);
        toast.success("Selected counselors deleted successfully");
      } catch (error) {
        console.error("Error deleting counselors:", error);
        toast.error("Failed to delete some counselors");
      }
    }
  };

  const filteredCounselors = counselors.filter((counselor) => {
    const name = counselor.name?.toLowerCase() || "";
    const specialization = counselor.specialization?.toLowerCase() || "";
    const expertise = counselor.expertise || [];

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      specialization.includes(searchTerm.toLowerCase()) ||
      expertise.some((exp) =>
        exp.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || counselor.status === filterStatus;

    const matchesSpecialization =
      filterSpecialization === "all" ||
      counselor.specialization === filterSpecialization;

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Sort counselors
  const sortedCounselors = [...filteredCounselors].sort((a, b) => {
    if (sortKey === "rating") {
      return sortDirection === "asc"
        ? a.rating - b.rating
        : b.rating - a.rating;
    }

    if (sortKey === "sessionCount") {
      return sortDirection === "asc"
        ? a.sessionCount - b.sessionCount
        : b.sessionCount - a.sessionCount;
    }

    if (sortKey === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    if (sortKey === "experience") {
      return sortDirection === "asc"
        ? a.experience - b.experience
        : b.experience - a.experience;
    }

    return 0;
  });

  // Get status badge element
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-900/30 dark:text-success-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-700/50 dark:text-neutral-300">
            <Clock className="mr-1 h-3 w-3" />
            Inactive
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-900/30 dark:text-warning-300">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-800 dark:bg-error-900/30 dark:text-error-300">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
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
            Counselor Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            View and manage counselor profiles
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
              to="/counselors/new"
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Counselor</span>
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
                placeholder="Search counselors..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  id="status-filter-btn"
                  type="button"
                  className="hidden inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <Filter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Status: {filterStatus === "all" ? "All" : filterStatus}
                  <ChevronDown className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {statusDropdownOpen && (
                  <div
                    id="status-filter-menu"
                    className="absolute right-0 z-10 mt-2 w-36 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
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
                          setFilterStatus("inactive");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Inactive
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("pending");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  id="specialization-filter-btn"
                  type="button"
                  className="hidden inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  onClick={() =>
                    setSpecializationDropdownOpen(!specializationDropdownOpen)
                  }
                >
                  <Filter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Specialization:{" "}
                  {filterSpecialization === "all"
                    ? "All"
                    : filterSpecialization}
                  <ChevronDown className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {specializationDropdownOpen && (
                  <div
                    id="specialization-filter-menu"
                    className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterSpecialization("all");
                          setSpecializationDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        All Specializations
                      </button>
                      {specializations.map((specialization) => (
                        <button
                          key={specialization}
                          onClick={() => {
                            setFilterSpecialization(specialization);
                            setSpecializationDropdownOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          {specialization}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fetchCounselors()}
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin text-neutral-500 dark:text-neutral-400" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {selectedCounselors.length > 0 && (
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900/50">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedCounselors.length} counselors selected
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-error-50 px-3 py-1 text-xs font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/30"
                onClick={deleteSelectedCounselors}
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading && !counselors.length ? (
            <div className="flex h-64 items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-primary-600" />
              <span className="ml-2 text-lg">Loading counselors...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 rounded-full bg-error-100 p-3 dark:bg-error-900/30">
                <AlertCircle className="h-6 w-6 text-error-500 dark:text-error-400" />
              </div>
              <h3 className="mb-1 text-base font-medium text-error-600 dark:text-error-400">
                {error}
              </h3>
              <button
                onClick={() => fetchCounselors()}
                className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
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
                          selectedCounselors.length ===
                            filteredCounselors.length &&
                          filteredCounselors.length > 0
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
                      onClick={() => handleSort("name")}
                    >
                      Counselor
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Specialization
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("experience")}
                    >
                      Experience
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("rating")}
                    >
                      Rating
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("sessionCount")}
                    >
                      Sessions
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Updated At
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
                {sortedCounselors.length > 0 ? (
                  sortedCounselors.map((counselor) => (
                    <tr
                      key={counselor.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                            checked={selectedCounselors.includes(counselor.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectCounselor(counselor.id);
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/counselors/${counselor.id}`)
                          }
                        >
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                            <img
                              src={counselor.photoURL}
                              alt={counselor.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                              {counselor.name}
                            </div>
                            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              {counselor.languages?.join(", ")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                          <BriefcaseBusiness className="mr-1 h-3 w-3" />
                          {counselor.specialization}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-neutral-900 dark:text-white">
                          {counselor.experience} years
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {counselor.expertise?.slice(0, 2).join(", ")}
                          {counselor.expertise?.length > 2 && "..."}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {counselor.rating > 0 ? (
                          <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 text-warning-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {counselor.rating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            —
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-neutral-900 dark:text-white">
                          {counselor.sessionCount}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {counselor.bookedSlots?.length || 0} upcoming
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          {counselor.updatedAt ? (
                            <>
                              <Calendar className="mr-2 h-4 w-4" />
                              {typeof counselor.updatedAt.toDate === "function"
                                ? formatDate(counselor.updatedAt.toDate())
                                : formatDate(counselor.updatedAt)}
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <div className="action-dropdown-container relative inline-block text-left">
                            <button
                              type="button"
                              className="flex items-center rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionDropdown(
                                  activeActionDropdown === counselor.id
                                    ? null
                                    : counselor.id
                                );
                              }}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            {activeActionDropdown === counselor.id && (
                              <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800">
                                <div className="py-1">
                                  <Link
                                    to={`/counselors/${counselor.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                    View
                                  </Link>
                                  {isAdmin && (
                                    <>
                                      <Link
                                        to={`/counselors/edit/${counselor.id}`}
                                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Edit className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                        Edit
                                      </Link>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCounselor(counselor.id);
                                        }}
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
                          <Users className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                        </div>
                        <h3 className="mb-1 text-base font-medium text-neutral-900 dark:text-white">
                          No counselors found
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {searchTerm ||
                          filterStatus !== "all" ||
                          filterSpecialization !== "all"
                            ? "Try adjusting your search or filters"
                            : "Add your first counselor"}
                        </p>
                        {isAdmin &&
                          !searchTerm &&
                          filterStatus === "all" &&
                          filterSpecialization === "all" && (
                            <Link
                              to="/counselors/new"
                              className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Counselor
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
                {sortedCounselors.length}
              </span>{" "}
              of{" "}
              <span className="mx-1 font-medium text-neutral-900 dark:text-white">
                {counselors.length}
              </span>{" "}
              counselors
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={loading} // Disable when loading
                onClick={() => fetchCounselors()}
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={!hasMore || loading} // Disable when no more items or loading
                onClick={() => fetchCounselors(true)} // true for load more
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

export default CounselorList;
