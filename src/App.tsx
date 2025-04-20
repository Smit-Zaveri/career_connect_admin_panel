import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import JobList from "./pages/jobs/JobList";
import JobDetails from "./pages/jobs/JobDetails";
import JobCreate from "./pages/jobs/JobCreate";
import JobEdit from "./pages/jobs/JobEdit";
import CommunityList from "./pages/community/CommunityList";
import CommunityCreate from "./pages/community/CommunityCreate";
import CommunityDetail from "./pages/community/CommunityDetail";
import CommunityEdit from "./pages/community/CommunityEdit";
import CounselorList from "./pages/counselors/CounselorList";
import CounselorDetails from "./pages/counselors/CounselorDetails";
import CounselorCreate from "./pages/counselors/CounselorCreate";
import CounselorEdit from "./pages/counselors/CounselorEdit";
import CounselorDashboard from "./pages/counselors/CounselorDashboard";
import CounselorBookings from "./pages/counselors/CounselorBookings";
import CounselorMeetings from "./pages/counselors/CounselorMeetings";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/profile/Profile";
import { useAuth } from "./context/AuthContext";

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: "admin" | "counselor" | "any";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole = "any",
}) => {
  const { isAuthenticated, isAdmin, isCounselor, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  if (requiredRole === "counselor" && !isCounselor) {
    return <Navigate to="/dashboard" />;
  }

  return <>{element}</>;
};

function App() {
  const { isAuthenticated, isCounselor } = useAuth();
  const location = useLocation();

  // Update document title based on current route
  useEffect(() => {
    const path = location.pathname;
    let title = "Admin Dashboard";

    if (path.includes("/jobs")) {
      title = "Job Management";
    } else if (path.includes("/community")) {
      title = "Community Management";
    } else if (path.includes("/counselors")) {
      title = "Counselor Management";
    } else if (path.includes("/login")) {
      title = "Login";
    } else if (path.includes("/counselor-dashboard")) {
      title = "Counselor Dashboard";
    }

    document.title = title;
  }, [location]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "dark:bg-neutral-800 dark:text-white",
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate
                to={isCounselor ? "/counselor-dashboard" : "/dashboard"}
              />
            )
          }
        />

        <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
          <Route
            index
            element={
              <Navigate
                to={isCounselor ? "/counselor-dashboard" : "/dashboard"}
              />
            }
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<JobList />} />
          <Route
            path="jobs/new"
            element={
              <ProtectedRoute element={<JobCreate />} requiredRole="admin" />
            }
          />
          <Route
            path="jobs/new-job"
            element={
              <ProtectedRoute element={<JobCreate />} requiredRole="admin" />
            }
          />
          <Route
            path="jobs/edit/:id"
            element={
              <ProtectedRoute element={<JobEdit />} requiredRole="admin" />
            }
          />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="community" element={<CommunityList />} />
          <Route
            path="community/new-post"
            element={
              <ProtectedRoute
                element={<CommunityCreate />}
                requiredRole="any"
              />
            }
          />
          <Route
            path="community/edit/:id"
            element={
              <ProtectedRoute element={<CommunityEdit />} requiredRole="any" />
            }
          />
          <Route path="community/:id" element={<CommunityDetail />} />
          <Route path="counselors" element={<CounselorList />} />
          <Route path="counselors/:id" element={<CounselorDetails />} />
          <Route
            path="counselors/new"
            element={
              <ProtectedRoute
                element={<CounselorCreate />}
                requiredRole="admin"
              />
            }
          />
          <Route
            path="counselors/edit/:id"
            element={
              <ProtectedRoute
                element={<CounselorEdit />}
                requiredRole="admin"
              />
            }
          />
          <Route
            path="counselor-dashboard"
            element={
              <ProtectedRoute
                element={<CounselorDashboard />}
                requiredRole="counselor"
              />
            }
          />
          <Route
            path="counselor-bookings"
            element={
              <ProtectedRoute
                element={<CounselorBookings />}
                requiredRole="counselor"
              />
            }
          />
          <Route
            path="counselor-meetings"
            element={
              <ProtectedRoute
                element={<CounselorMeetings />}
                requiredRole="counselor"
              />
            }
          />
          <Route
            path="calendar"
            element={<div className="p-6">Calendar page coming soon</div>}
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute element={<Settings />} requiredRole="admin" />
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute element={<Profile />} requiredRole="any" />
            }
          />
          {/* Search route removed to fix 404 error */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
