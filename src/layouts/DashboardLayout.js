import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Wine } from "lucide-react";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        <span className="mobile-title">{isAdmin ? "Admin Console" : "wines_cases"}</span>
      </header>

      {/* Sidebar with overlay for mobile */}
      <div className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        <Sidebar closeMobile={() => setIsSidebarOpen(false)} />
      </div>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
