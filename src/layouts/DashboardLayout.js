import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Wine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`layout ${isAdmin ? "admin-layout" : ""} ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
        <Wine size={20} className="ml-2 text-primary" />
        <span className="mobile-title">{isAdmin ? "Admin Console" : "Royal wines"}</span>
      </header>

      {/* Sidebar with overlay for mobile */}
      <div className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        <Sidebar closeMobile={() => setIsSidebarOpen(false)} />
      </div>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
