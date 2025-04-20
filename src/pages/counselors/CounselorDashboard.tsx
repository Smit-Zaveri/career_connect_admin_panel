import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  User,
  CheckCircle,
  XCircle,
  ChevronRight,
  Video,
  MessageCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface BookingSummary {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

interface UpcomingBooking {
  id: string;
  studentName: string;
  studentPhoto?: string;
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  meetLink?: string;
}

const CounselorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>(
    []
  );
  const [availabilityStatus, setAvailabilityStatus] = useState<boolean>(true);
  const [fetchingStatus, setFetchingStatus] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Here we would normally fetch data from the API
        // For now, let's simulate some data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setBookingSummary({
          total: 28,
          upcoming: 5,
          completed: 21,
          cancelled: 2,
        });

        setUpcomingBookings([
          {
            id: "booking-1",
            studentName: "Alex Johnson",
            studentPhoto: "https://randomuser.me/api/portraits/men/32.jpg",
            date: "2025-04-20", // tomorrow
            time: "10:00",
            duration: 30,
            status: "scheduled",
            meetLink: "https://meet.example.com/abc123",
          },
          {
            id: "booking-2",
            studentName: "Sophia Rodriguez",
            date: "2025-04-20",
            time: "13:30",
            duration: 45,
            status: "scheduled",
          },
          {
            id: "booking-3",
            studentName: "Michael Chang",
            studentPhoto: "https://randomuser.me/api/portraits/men/75.jpg",
            date: "2025-04-21",
            time: "09:00",
            duration: 60,
            status: "scheduled",
            meetLink: "https://meet.example.com/def456",
          },
          {
            id: "booking-4",
            studentName: "Emily Wilson",
            studentPhoto: "https://randomuser.me/api/portraits/women/23.jpg",
            date: "2025-04-22",
            time: "15:00",
            duration: 30,
            status: "scheduled",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleAvailabilityStatus = async () => {
    setFetchingStatus(true);
    try {
      // Here we would toggle status via API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAvailabilityStatus(!availabilityStatus);
      toast.success(
        `You are now ${
          !availabilityStatus ? "available" : "unavailable"
        } for new appointments`
      );
    } catch (error) {
      toast.error("Failed to update availability status");
    } finally {
      setFetchingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <motion.div
        className="flex flex-col justify-between md:flex-row md:items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Welcome back, {user?.name || "Counselor"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Here's an overview of your counseling activities
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-4 md:mt-0">
          <div className="flex items-center">
            <div
              className={`mr-2 h-3 w-3 rounded-full ${
                availabilityStatus
                  ? "bg-success-500"
                  : "bg-neutral-400 dark:bg-neutral-600"
              }`}
            ></div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {availabilityStatus ? "Available" : "Unavailable"}
            </span>
          </div>
          <button
            onClick={toggleAvailabilityStatus}
            disabled={fetchingStatus}
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {fetchingStatus ? (
              <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <></>
            )}
            {availabilityStatus ? "Set as Unavailable" : "Set as Available"}
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
              <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {bookingSummary.total}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Total Sessions
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-success-50 p-3 dark:bg-success-900/20">
              <Clock className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {bookingSummary.upcoming}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Upcoming Sessions
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-info-50 p-3 dark:bg-info-900/20">
              <CheckCircle className="h-6 w-6 text-info-600 dark:text-info-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {bookingSummary.completed}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Completed Sessions
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
              <XCircle className="h-6 w-6 text-error-600 dark:text-error-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {bookingSummary.cancelled}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Cancelled Sessions
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming bookings section */}
      <motion.div
        className="rounded-lg bg-white shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Upcoming Sessions
            </h2>
            <div className="mt-2 flex sm:mt-0">
              <Link
                to="/counselor-bookings"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View all sessions
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Search box - not functional in this demo */}
          <div className="mb-4">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-4 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 sm:text-sm"
                placeholder="Search sessions by name or ID..."
              />
            </div>
          </div>

          {/* Upcoming bookings list */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {upcomingBookings.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <Calendar className="h-6 w-6 text-neutral-400" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
                  No upcoming sessions
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  You have no scheduled sessions at the moment.
                </p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col items-start justify-between py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      {booking.studentPhoto ? (
                        <img
                          src={booking.studentPhoto}
                          alt={booking.studentName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-600 dark:text-neutral-400">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">
                        {booking.studentName}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center mr-3">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(booking.date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {booking.time} ({booking.duration} min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex w-full justify-start space-x-3 sm:mt-0 sm:w-auto sm:justify-end">
                    {/* Meeting link button */}
                    {booking.meetLink ? (
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                      >
                        <Video className="mr-1.5 h-4 w-4" />
                        Join Meeting
                      </a>
                    ) : (
                      <button className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                        <Video className="mr-1.5 h-4 w-4" />
                        Set up Meeting
                      </button>
                    )}

                    {/* Message button */}
                    <button className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                      <MessageCircle className="mr-1.5 h-4 w-4" />
                      Message
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/counselor-bookings"
              className="flex flex-col items-center rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700/50"
            >
              <Calendar className="mb-2 h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              <span className="text-center text-sm font-medium text-neutral-900 dark:text-white">
                Manage Schedule
              </span>
            </Link>

            <Link
              to="/counselor-meetings"
              className="flex flex-col items-center rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700/50"
            >
              <Video className="mb-2 h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              <span className="text-center text-sm font-medium text-neutral-900 dark:text-white">
                My Meetings
              </span>
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Your Profile
          </h2>
          <div className="flex items-center">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-600 dark:text-neutral-400">
                  <User className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-neutral-900 dark:text-white">
                {user?.name || "Counselor Name"}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {user?.email || "counselor@example.com"}
              </p>
              <Link
                to="/profile"
                className="mt-1 inline-flex text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CounselorDashboard;
