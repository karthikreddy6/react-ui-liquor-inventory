import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, ShoppingCart, Package, Wine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Sidebar = ({ closeMobile }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const isAdmin = user?.role === "admin";
  
  const staffLinks = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Present Stock", path: "/stock", icon: Package },
    { name: "Invoices", path: "/invoice", icon: FileText },
    { name: "Sell Reports", path: "/sell-report", icon: ShoppingCart },
  ];

  const adminLinks = [
    { name: "System Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Live Stock", path: "/stock", icon: Package },
    { name: "Invoice History", path: "/invoice", icon: FileText },
    { name: "Sell Reports", path: "/sell-report", icon: ShoppingCart },
  ];

  const links = isAdmin ? adminLinks : staffLinks;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <div className={`sidebar ${isAdmin ? "admin-sidebar" : ""}`}>
      <div className="sidebar-header">
        <Wine size={24} className="text-primary mr-2" />
        <h2>{isAdmin ? "Admin Console" : "Royal wines"}</h2>
      </div>
      
      <div className="user-info">
        <div className={`avatar ${isAdmin ? "admin-avatar" : ""}`}>
          {user?.name?.charAt(0) || "A"}
        </div>
        <div className="details">
          <p className="name">{user?.name}</p>
          <p className="role">{user?.role}</p>
        </div>
      </div>

      <motion.nav 
        className="nav-menu"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <motion.div key={link.path} variants={itemVariants}>
              <Link
                to={link.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={closeMobile}
              >
                <Icon size={20} />
                <span>{link.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      <motion.button 
        onClick={logout} 
        className="logout-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </motion.button>
    </div>
  );
};

export default Sidebar;