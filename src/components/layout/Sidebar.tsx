import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Video,
} from "lucide-react";

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredRole?: "admin" | "counselor" | "any";
}

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  setIsCollapsed = () => {},
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, isAdmin, isCounselor } = useAuth();
  const location = useLocation();

  // Nav items with role permissions
  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      path: isCounselor ? "/counselor-dashboard" : "/dashboard",
      icon: <Home className="h-5 w-5" />,
      requiredRole: "any",
    },
    {
      title: "Counselor Management",
      path: "/counselors",
      icon: <Users className="h-5 w-5" />,
      requiredRole: "admin",
    },
    {
      title: "Jobs",
      path: "/jobs",
      icon: <Briefcase className="h-5 w-5" />,
      requiredRole: "any",
    },
    {
      title: "Community",
      path: "/community",
      icon: <MessageSquare className="h-5 w-5" />,
      requiredRole: "any",
    },
    {
      title: "Your Schedule",
      path: "/counselor-bookings",
      icon: <Calendar className="h-5 w-5" />,
      requiredRole: "counselor",
    },
    {
      title: "Upcoming Sessions",
      path: "/counselor-meetings",
      icon: <Video className="h-5 w-5" />,
      requiredRole: "counselor",
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      requiredRole: "admin",
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) => {
    if (item.requiredRole === "admin" && !isAdmin) return false;
    if (item.requiredRole === "counselor" && !isCounselor) return false;
    return true;
  });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 block lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="rounded-md bg-primary-600 p-2 text-white shadow-lg transition hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 transform bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={toggleMobileMenu}
      ></div>

      <div
        className={`fixed top-0 left-0 z-40 h-full w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 dark:bg-neutral-900 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center border-b border-neutral-200 py-6 dark:border-neutral-700">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              Career App
            </h1>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition ${
                  location.pathname === item.path
                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="mr-3 text-neutral-500 dark:text-neutral-400">
                  {item.icon}
                </span>
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-700">
            <Link
              to="/profile"
              className="flex items-center rounded-md px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <span className="mr-3 text-neutral-500 dark:text-neutral-400">
                <User className="h-5 w-5" />
              </span>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-md px-4 py-3 text-sm font-medium text-error-700 transition hover:bg-neutral-100 dark:text-error-300 dark:hover:bg-neutral-800"
            >
              <span className="mr-3">
                <LogOut className="h-5 w-5" />
              </span>
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "5rem" : "16rem",
          transition: { duration: 0.3 },
        }}
        className="hidden h-screen border-r border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 lg:block"
      >
        <div className="flex h-full flex-col">
          <div
            className={`flex items-center ${
              !isCollapsed ? "justify-between px-6" : "justify-center"
            } border-b border-neutral-200 py-6 dark:border-neutral-700`}
          >
            {!isCollapsed ? (
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Career App
              </h1>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                C
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-md px-3 py-3 text-sm font-medium transition ${
                  location.pathname === item.path
                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <span
                  className={`${
                    isCollapsed && "mx-auto"
                  } text-neutral-500 dark:text-neutral-400`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            ))}
          </nav>

          <div className="border-t border-neutral-200 px-3 py-4 dark:border-neutral-700">
            <Link
              to="/profile"
              className={`flex items-center rounded-md px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
                isCollapsed && "justify-center"
              }`}
            >
              <span className="text-neutral-500 dark:text-neutral-400">
                <User className="h-5 w-5" />
              </span>
              {!isCollapsed && <span className="ml-3">Profile</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`flex items-center rounded-md px-3 py-3 text-sm font-medium text-error-700 transition hover:bg-neutral-100 dark:text-error-300 dark:hover:bg-neutral-800 ${
                isCollapsed ? "mx-auto w-full justify-center" : "w-full"
              }`}
            >
              <span>
                <LogOut className="h-5 w-5" />
              </span>
              {!isCollapsed && <span className="ml-3">Log Out</span>}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
