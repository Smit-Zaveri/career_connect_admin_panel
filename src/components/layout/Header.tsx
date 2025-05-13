import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Bell, User, Sun, Moon, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "./Breadcrumb";

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Sample notifications data
const SAMPLE_NOTIFICATIONS: NotificationProps[] = [
  {
    id: "1",
    title: "New Counselor Application",
    message: "A new counselor has applied to join the platform",
    time: "5 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Job Post Approved",
    message: "Marketing Specialist job post has been approved",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "System Update",
    message: "System maintenance scheduled for tonight at 2 AM",
    time: "3 hours ago",
    read: true,
  },
];

const Header: React.FC<{ toggleMobileSidebar: () => void }> = ({
  toggleMobileSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationProps[]>(SAMPLE_NOTIFICATIONS);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="pl-4 md:pl-[72px] lg:pl-64">
        <button
          className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
          onClick={toggleMobileSidebar}
          aria-label="Toggle mobile sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="ml-4 flex-1">
        <Breadcrumb />
      </div>

      <div className="flex items-center space-x-1 pr-4">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 animate-fade-in rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-2 flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-700">
                <h3 className="font-medium dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`mb-2 rounded-md p-2 transition-colors last:mb-0 ${
                        !notification.read
                          ? "bg-primary-50 dark:bg-primary-900/20"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {notification.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                        {notification.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            className="flex items-center space-x-1 rounded-full py-1 pl-1 pr-2 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-full w-full p-1 text-neutral-500 dark:text-neutral-400" />
              )}
            </div>
            <div className="hidden items-center md:flex">
              <span className="max-w-[100px] truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {user?.name}
              </span>
              <ChevronDown className="ml-1 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 animate-fade-in rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
              <div className="border-b border-neutral-200 p-3 dark:border-neutral-700">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {user?.name}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user?.email}
                </div>
                <div className="mt-1 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium capitalize text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  {user?.role}
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/50"
                >
                  My Profile
                </Link>
                {/* <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/50"
                >
                  Account Settings
                </Link> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
