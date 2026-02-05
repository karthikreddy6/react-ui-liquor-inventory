import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, LogOut, ShoppingCart, Package, Wine } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className={`sidebar ${isAdmin ? "admin-sidebar" : ""}`}>
      <div className="sidebar-header">
        <Wine size={24} className="text-primary mr-2" />
        <h2>{isAdmin ? "Admin Console" : "wines_cases"}</h2>
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

      <nav className="nav-menu">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={closeMobile}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <button onClick={logout} className="logout-btn">
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;