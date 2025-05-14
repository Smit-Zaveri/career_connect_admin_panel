import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, Sun, Shield, FileText, Loader, Save } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newMessages: true,
    sessionReminders: true,
    appUpdates: false,
    marketingEmails: false,
    communityUpdates: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, connections, private
    showEmail: false,
    showPhone: false,
    enableTwoFactor: true,
    dataSharing: false,
  });

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePrivacyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    const value =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setPrivacySettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, we would save the settings to Firebase or another backend
      // For now, just show a success message
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Settings navigation - left sidebar for larger screens */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 sticky top-5 transition-all duration-300 hover:shadow-md">
            <h3 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Settings Menu
            </h3>
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  const section = document.getElementById("appearance");
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20 hover:shadow-sm"
              >
                <Moon className="mr-3 h-5 w-5" />
                Appearance
              </button>
              <button
                type="button"
                onClick={() => {
                  const section = document.getElementById("notifications");
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 text-neutral-700 hover:bg-neutral-100 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button
                type="button"
                onClick={() => {
                  const section = document.getElementById("privacy");
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 text-neutral-700 hover:bg-neutral-100 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Shield className="mr-3 h-5 w-5" />
                Privacy & Security
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Main settings content area */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Appearance section */}
          <section
            id="appearance"
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 scroll-mt-20"
          >
            <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              <Moon className="mr-2 h-5 w-5" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Theme Preference
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => (theme === "light" ? null : toggleTheme())}
                    className={`flex flex-1 items-center justify-center space-x-2 rounded-lg border p-4 ${
                      theme === "light"
                        ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    <Sun className="h-6 w-6 text-amber-500" />
                    <span className="font-medium">Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => (theme === "dark" ? null : toggleTheme())}
                    className={`flex flex-1 items-center justify-center space-x-2 rounded-lg border p-4 ${
                      theme === "dark"
                        ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    <Moon className="h-6 w-6 text-indigo-500" />
                    <span className="font-medium">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications section */}
          <section
            id="notifications"
            className="mt-6 rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 scroll-mt-20"
          >
            <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email Notifications
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Receive emails about your account activity
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    New Message Alerts
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Get notified when you receive new messages
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="newMessages"
                    checked={notificationSettings.newMessages}
                    onChange={handleNotificationChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Session Reminders
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Get reminders about upcoming counseling sessions
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="sessionReminders"
                    checked={notificationSettings.sessionReminders}
                    onChange={handleNotificationChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    App Updates
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Get notified about platform updates and new features
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="appUpdates"
                    checked={notificationSettings.appUpdates}
                    onChange={handleNotificationChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Privacy & Security section */}
          <section
            id="privacy"
            className="mt-6 rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 scroll-mt-20"
          >
            <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Privacy & Security
            </h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Profile Visibility
                </label>
                <select
                  name="profileVisibility"
                  value={privacySettings.profileVisibility}
                  onChange={handlePrivacyChange}
                  className="block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                >
                  <option value="public">
                    Public - Anyone can view your profile
                  </option>
                  <option value="connections">
                    Connections Only - Only your connections
                  </option>
                  <option value="private">Private - Only you</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Show Email Address on Profile
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Make your email address visible to others
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="showEmail"
                    checked={privacySettings.showEmail}
                    onChange={handlePrivacyChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="enableTwoFactor"
                    checked={privacySettings.enableTwoFactor}
                    onChange={handlePrivacyChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Data Sharing for Analytics
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Allow anonymous data sharing to improve services
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="dataSharing"
                    checked={privacySettings.dataSharing}
                    onChange={handlePrivacyChange}
                    className="peer sr-only"
                  />
                  <span className="peer h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:bg-neutral-600 dark:peer-focus:ring-primary-800"></span>
                </label>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Download Your Data
                </h3>
                <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Get a copy of your personal data and activity
                </p>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download Data
                </button>
              </div>
            </div>
          </section>

          {/* Save button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              {saving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
