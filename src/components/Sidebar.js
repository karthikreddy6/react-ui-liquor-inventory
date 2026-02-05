import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, LogOut, ShoppingCart, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Present Stock", path: "/stock", icon: Package },
    { name: "Invoices", path: "/invoice", icon: FileText },
    { name: "Sell Reports", path: "/sell-report", icon: ShoppingCart },
    { name: "Admin", path: "/admin", icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Inventory v1</h2>
      </div>
      
      <div className="user-info">
        <div className="avatar">
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
