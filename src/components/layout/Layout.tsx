import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const Layout: React.FC = () => {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (!user) return null;

  // Dynamic padding and width for main content based on sidebar state
  const mainContentStyles = isCollapsed
    ? "md:pl-20 md:w-[calc(100%-5rem)]"
    : "md:pl-64 md:w-[calc(100%-16rem)]";

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Desktop Sidebar - Fixed position to ensure it stays at the top level */}
      <div className="fixed left-0 top-0 h-full hidden z-30 md:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Sidebar with backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-20 bg-black"
              onClick={toggleMobileSidebar}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 top-0 z-30 h-full w-64 md:hidden"
            >
              <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area with dynamic left padding and width for sidebar on desktop */}
      <div
        className={`flex flex-1 flex-col w-full ${mainContentStyles} transition-all duration-300 ease-in-out`}
      >
        <Header toggleMobileSidebar={toggleMobileSidebar} />

        <main className="flex-1 overflow-auto pt-16">
          <div className="container mx-auto max-w-7xl p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
