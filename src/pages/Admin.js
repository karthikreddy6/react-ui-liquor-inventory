import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogs from "./admin/AdminLogs";
import AdminTools from "./admin/AdminTools";
import { API_BASE } from "../apiConfig";

const Admin = () => {
  const { user, token, logout } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const isBasicAuth = token?.startsWith("Basic");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin`, {
          headers: { 
            "Authorization": token,
            "Accept": "application/json"
          }
        });
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch admin data");
        const data = await res.json();
        setAdminData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if ((user?.role === "admin" || user?.role === "owner" || user?.role === "supervisor") && token) {
      fetchAdminData();
    } else if (!user && !token) {
      setLoading(false);
    }
  }, [token, user, logout]);

  if (user?.role !== "admin" && user?.role !== "owner" && user?.role !== "supervisor") {
    return (
      <div className="empty-state p-5">
        <AlertCircle size={48} className="text-danger mb-3" />
        <h3>Access Denied</h3>
        <p>You do not have privileges to view this page.</p>
      </div>
    );
  }

  if (loading) return <div className="p-5 text-center text-muted">Loading administrative console...</div>;

  return (
    <div className="admin-page fade-in">
      <header className="page-header">
        <div>
          <h1>Admin Console</h1>
          <p className="text-muted">System monitoring and administrative tools.</p>
        </div>
        {adminData && (
          <div className="flex-gap">
             <div className="admin-badge success">
                {isBasicAuth ? "Mode: Basic Auth" : "Mode: JWT (Bearer)"}
             </div>
             <div className="admin-badge success">
                Status: {adminData.status || "Online"}
             </div>
          </div>
        )}
      </header>

      {error && <div className="error-banner mb-4"><AlertCircle size={16}/> {error}</div>}

      <div className="admin-tabs mb-4">
        <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={`tab-btn ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>System Logs</button>
        <button className={`tab-btn ${activeTab === "manage" ? "active" : ""}`} onClick={() => setActiveTab("manage")}>Management</button>
      </div>

      {activeTab === "overview" && <AdminDashboard adminData={adminData} isBasicAuth={isBasicAuth} />}
      {activeTab === "logs" && <AdminLogs token={token} isBasicAuth={isBasicAuth} />}
      {activeTab === "manage" && <AdminTools token={token} isBasicAuth={isBasicAuth} />}
    </div>
  );
};

export default Admin;