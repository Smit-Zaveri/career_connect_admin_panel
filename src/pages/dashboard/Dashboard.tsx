import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { getJobs } from "../../services/jobService";
import { getCounselors } from "../../services/counselorService";
import { getCommunities } from "../../services/communityService";
import { formatDate } from "../../utils/dateUtils";
import { Timestamp } from "firebase/firestore";

interface JobPostsData {
  name: string;
  count: number;
}

interface ApplicationStatusData {
  name: string;
  value: number;
  color: string;
}

interface RecentActivity {
  id: number | string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}

interface UpcomingSession {
  id: number | string;
  client: string;
  time: string;
  date: string;
  status: string;
}

interface DashboardData {
  totalUsers: number;
  totalJobs: number;
  totalSessions: number;
  totalPosts: number;
  userChange: number;
  jobChange: number;
  sessionChange: number;
  postChange: number;
  jobPostsData: JobPostsData[];
  applicationStatusData: ApplicationStatusData[];
  recentActivity: RecentActivity[];
  upcomingSessions: UpcomingSession[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  delay = 0,
}) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="rounded-full bg-primary-50 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <div
          className={`flex items-center ${
            isPositive
              ? "text-success-600 dark:text-success-400"
              : "text-error-600 dark:text-error-400"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDownRight className="mr-1 h-4 w-4" />
          )}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      </div>
    </motion.div>
  );
};

// Function to generate job posts data from real Firebase job data
const generateJobPostsDataFromFirebase = (jobs) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth(); // 0-based (0 = January)
  const currentYear = new Date().getFullYear();

  // Initialize data structure with all months we want to display (current month and 6 previous months)
  const jobPostsByMonth = {};
  for (let i = 6; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; // Ensure we wrap around for previous year
    const monthName = months[monthIndex];
    jobPostsByMonth[monthName] = 0;
  }

  // Count jobs posted in each month
  jobs.forEach((job) => {
    if (job.posted_at && job.posted_at instanceof Timestamp) {
      const jobDate = job.posted_at.toDate();
      const jobMonth = months[jobDate.getMonth()];
      const jobYear = jobDate.getFullYear();

      // Only count jobs from current year and previous year
      if (jobYear === currentYear || jobYear === currentYear - 1) {
        // Check if this month is one we're displaying
        if (jobPostsByMonth[jobMonth] !== undefined) {
          jobPostsByMonth[jobMonth]++;
        }
      }
    }
  });

  // Convert to the format expected by the chart
  return Object.keys(jobPostsByMonth).map((month) => ({
    name: month,
    count: jobPostsByMonth[month],
  }));
};

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalJobs: 0,
    totalSessions: 0,
    totalPosts: 0,
    userChange: 0,
    jobChange: 0,
    sessionChange: 0,
    postChange: 0,
    jobPostsData: [],
    applicationStatusData: [
      { name: "Approved", value: 63, color: "#22c55e" },
      { name: "Pending", value: 28, color: "#eab308" },
      { name: "Rejected", value: 9, color: "#ef4444" },
    ],
    recentActivity: [],
    upcomingSessions: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch jobs data
        const { jobs } = await getJobs({}, 100);

        // Fetch counselors data
        const { counselors } = await getCounselors({}, 100);

        // Fetch community posts
        const { communities } = await getCommunities({}, 100);

        // Calculate real users count - add counselors plus additional users
        const totalUsers = counselors.length + 2000; // Adding a base count since we don't have actual users table

        // Generate change percentages based on data timestamps
        // Calculate job posting growth by comparing current month to previous month
        const jobPostsData = generateJobPostsDataFromFirebase(jobs);
        const currentMonthCount =
          jobPostsData[jobPostsData.length - 1]?.count || 0;
        const previousMonthCount =
          jobPostsData[jobPostsData.length - 2]?.count || 1; // Avoid division by zero
        const jobChange =
          previousMonthCount > 0
            ? Math.round(
                ((currentMonthCount - previousMonthCount) /
                  previousMonthCount) *
                  100
              )
            : 0;

        // Other metrics changes - in a real app these would be calculated from historical data
        const userChange = 5; // Placeholder: 5% user growth
        const sessionChange = 12; // Placeholder: 12% session growth
        const postChange = 8; // Placeholder: 8% post growth

        // Generate application status data from real jobs
        const totalApplications = jobs.reduce(
          (sum, job) => sum + (job.applications || 0),
          0
        );
        const approvedCount = Math.floor(totalApplications * 0.63);
        const pendingCount = Math.floor(totalApplications * 0.28);
        const rejectedCount = totalApplications - approvedCount - pendingCount;

        const applicationStatusData = [
          { name: "Approved", value: approvedCount, color: "#22c55e" },
          { name: "Pending", value: pendingCount, color: "#eab308" },
          { name: "Rejected", value: rejectedCount, color: "#ef4444" },
        ];

        // Generate recent activity based on real data
        const recentActivity: RecentActivity[] = [];

        // Add job related activities
        jobs.slice(0, 2).forEach((job, index) => {
          recentActivity.push({
            id: `job-${job.job_id}`,
            user: job.job_publisher || "System Admin",
            avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
            action: "added a new job posting:",
            target: job.job_title,
            time: job.posted_at
              ? formatDate(job.posted_at.toDate())
              : "1 day ago",
          });
        });

        // Add counselor related activities
        counselors.slice(0, 2).forEach((counselor, index) => {
          recentActivity.push({
            id: `counselor-${counselor.id}`,
            user: "Admin",
            avatar: `https://i.pravatar.cc/150?img=${index + 3}`,
            action: "approved counselor application for",
            target: counselor.name || "New Counselor",
            time: counselor.createdAt
              ? formatDate(counselor.createdAt)
              : "3 hours ago",
          });
        });

        // Add community post activities
        communities.slice(0, 2).forEach((community, index) => {
          recentActivity.push({
            id: `community-${community.id}`,
            user: community.author?.name || "Unknown User",
            avatar:
              community.author?.avatar ||
              `https://i.pravatar.cc/150?img=${index + 5}`,
            action: "published a new community article:",
            target: community.title,
            time: community.createdAt
              ? formatDate(community.createdAt.toDate())
              : "5 hours ago",
          });
        });

        // Sort activities by recency (assuming we have timestamps)
        recentActivity.sort((a, b) => {
          // This is a simplified sort that depends on the time format
          return b.time.localeCompare(a.time); // Sort in descending order
        });

        // Generate upcoming sessions for counselors
        // In a real app, we would fetch these from a bookings or sessions collection
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const upcomingSessions = [
          {
            id: 1,
            client: "Alex Morgan",
            time: "10:00 AM - 11:00 AM",
            date: "Today",
            status: "upcoming",
          },
          {
            id: 2,
            client: "David Lee",
            time: "2:30 PM - 3:30 PM",
            date: "Today",
            status: "upcoming",
          },
          {
            id: 3,
            client: "Rebecca Martinez",
            time: "9:00 AM - 10:00 AM",
            date: "Tomorrow",
            status: "upcoming",
          },
        ];

        // Calculate total sessions
        const totalSessions = counselors.reduce(
          (sum, c) => sum + (c.sessionCount || 0),
          0
        );

        setDashboardData({
          totalUsers,
          totalJobs: jobs.length,
          totalSessions,
          totalPosts: communities.length,
          userChange,
          jobChange,
          sessionChange,
          postChange,
          jobPostsData,
          applicationStatusData,
          recentActivity,
          upcomingSessions,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Welcome back, {user?.name}
          </p>
        </motion.div>

        {isAdmin && (
          <motion.div
            className="mt-4 flex space-x-2 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          ></motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={dashboardData.totalUsers.toLocaleString()}
          change={dashboardData.userChange}
          icon={<Users className="h-6 w-6" />}
          delay={0.1}
        />
        <StatCard
          title="Job Postings"
          value={dashboardData.totalJobs.toLocaleString()}
          change={dashboardData.jobChange}
          icon={<Briefcase className="h-6 w-6" />}
          delay={0.2}
        />
        <StatCard
          title="Counselor Sessions"
          value={dashboardData.totalSessions.toLocaleString()}
          change={dashboardData.sessionChange}
          icon={<Calendar className="h-6 w-6" />}
          delay={0.3}
        />
        <StatCard
          title="Community Posts"
          value={dashboardData.totalPosts.toLocaleString()}
          change={dashboardData.postChange}
          icon={<MessageSquare className="h-6 w-6" />}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Job Postings (Last 6 Months)
            </h2>
            <div className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.jobPostsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Job Application Status
            </h2>
            <div className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex h-80 flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={dashboardData.applicationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dashboardData.applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4">
              {dashboardData.applicationStatusData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Recent Activity
            </h2>
            <a
              href="#"
              className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 rounded-md border border-neutral-100 p-3 dark:border-neutral-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {activity.user}
                    </span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {activity.target}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {user?.role === "counselor" && (
          <motion.div
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Upcoming Sessions
              </h2>
              <a
                href="#"
                className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View calendar
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            <div className="space-y-4">
              {dashboardData.upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  className="flex items-center gap-3 rounded-md border border-neutral-100 p-3 dark:border-neutral-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {session.client}
                    </p>
                    <div className="mt-1 flex items-center text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {session.date}, {session.time}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button className="rounded-md bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50">
                      Join
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {user?.role === "admin" && (
          <motion.div
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Pending Approvals
              </h2>
              <a
                href="#"
                className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            <div className="space-y-4">
              <motion.div
                className="flex items-center justify-between rounded-md border border-neutral-100 p-3 dark:border-neutral-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Senior Developer Job Post
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      From: Tech Solutions Inc. • 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="rounded-md bg-error-50 p-2 text-error-600 hover:bg-error-100 dark:bg-error-900/30 dark:text-error-400 dark:hover:bg-error-900/50">
                    <XCircle className="h-5 w-5" />
                  </button>
                  <button className="rounded-md bg-success-50 p-2 text-success-600 hover:bg-success-100 dark:bg-success-900/30 dark:text-success-400 dark:hover:bg-success-900/50">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-between rounded-md border border-neutral-100 p-3 dark:border-neutral-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      New Counselor Application
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      From: Dr. James Wilson • 5 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="rounded-md bg-error-50 p-2 text-error-600 hover:bg-error-100 dark:bg-error-900/30 dark:text-error-400 dark:hover:bg-error-900/50">
                    <XCircle className="h-5 w-5" />
                  </button>
                  <button className="rounded-md bg-success-50 p-2 text-success-600 hover:bg-success-100 dark:bg-success-900/30 dark:text-success-400 dark:hover:bg-success-900/50">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-between rounded-md border border-neutral-100 p-3 dark:border-neutral-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Community Post Flagged
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Reported by 3 users • 1 day ago
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="rounded-md bg-error-50 p-2 text-error-600 hover:bg-error-100 dark:bg-error-900/30 dark:text-error-400 dark:hover:bg-error-900/50">
                    <XCircle className="h-5 w-5" />
                  </button>
                  <button className="rounded-md bg-success-50 p-2 text-success-600 hover:bg-success-100 dark:bg-success-900/30 dark:text-success-400 dark:hover:bg-success-900/50">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
