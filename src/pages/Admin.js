import React from "react";
import { User, Shield, Key, AlertCircle, Clock, List, Trash2, Lock, Edit3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://192.168.1.114:5000";

const Admin = () => {
  const { user, token, logout } = useAuth();
  const [adminData, setAdminData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("overview");

  // State for logs and management
  const [logs, setLogs] = React.useState([]);
  const [logLoading, setLogLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const isBasicAuth = token?.startsWith("Basic");

  React.useEffect(() => {
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

    if (user?.role === "admin" || user?.role === "owner" || user?.role === "supervisor") {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [token, user, logout]);

  // --- API Handlers ---

  const fetchLogs = async (endpoint) => {
    setLogLoading(true);
    setLogs([]);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : (data.logs || data.items || []));
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLogLoading(false);
    }
  };

  const handleDeleteAction = async (endpoint, identifier) => {
    if (!window.confirm(`Are you sure you want to delete ${identifier}?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Delete failed");
      alert("Successfully deleted: " + identifier);
    } catch (err) {
      alert("Delete Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStock = async () => {
    const stockId = window.prompt("Enter Stock ID to edit:");
    if (!stockId) return;
    const cases = window.prompt("Enter new Total Cases:");
    const bottles = window.prompt("Enter new Total Bottles:");
    const rate = window.prompt("Enter new Rate per Case:");

    if (cases === null || bottles === null || rate === null) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stock/${stockId}`, {
        method: "PATCH",
        headers: { 
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          total_cases: Number(cases),
          total_bottles: Number(bottles),
          rate_per_case: Number(rate)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      alert("Stock updated successfully!");
    } catch (err) {
      alert("Update Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

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

      {activeTab === "overview" && (
        <div className="admin-grid">
            <div className="card highlight-card">
            <div className="card-header">
                <Shield size={20} className="icon" />
                <h3>API Technical Reference</h3>
            </div>
            <div className="api-ref-content">
                <div className="api-option">
                <h4>Option 1: Staff API (JWT)</h4>
                <code>Authorization: Bearer &lt;token&gt;</code>
                <p className="mt-1 text-small">For Stock, Invoices, Sell Reports, Dashboard.</p>
                </div>
                <hr />
                <div className="api-option">
                <h4>Option 2: Admin API (Basic Auth)</h4>
                <code>Authorization: Basic base64(admin:admin123)</code>
                <p className="mt-1 text-small">For system-level operations (Logs, Deletes, Patching).</p>
                </div>
            </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <Clock size={20} className="icon" />
                    <h3>System Uptime</h3>
                </div>
                <div className="value">{adminData?.uptime_seconds}s</div>
                <p className="text-small text-muted">Server Time: {adminData?.server_time}</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <List size={20} className="icon" />
                    <h3>Database Stats</h3>
                </div>
                <div className="stats-list">
                    <div className="flex-between mb-1"><span>Invoices:</span> <strong>{adminData?.invoice_count}</strong></div>
                    <div className="flex-between mb-1"><span>Stock Items:</span> <strong>{adminData?.stock_count}</strong></div>
                    <div className="flex-between"><span>Latest Inv:</span> <strong>{adminData?.latest_invoice_number}</strong></div>
                </div>
            </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="admin-grid logs-grid">
            <div className="logs-sidebar">
                <div className="card">
                    <div className="card-header"><List size={20}/> <h3>Audit Logs</h3></div>
                    <p className="text-small text-muted mb-3">Recent system activities and changes.</p>
                    {!isBasicAuth && <div className="alert-warning-small mb-3"><AlertCircle size={14}/> Basic Auth Required</div>}
                    <button className="btn-outline w-full" disabled={!isBasicAuth || logLoading} onClick={() => fetchLogs('/admin/audit-logs')}>
                        {logLoading ? "Fetching..." : "Fetch Audit Logs"}
                    </button>
                </div>
                <div className="card mt-4">
                    <div className="card-header"><User size={20}/> <h3>Last Logins</h3></div>
                    <p className="text-small text-muted mb-3">Monitor recent user access.</p>
                    {!isBasicAuth && <div className="alert-warning-small mb-3"><AlertCircle size={14}/> Basic Auth Required</div>}
                    <button className="btn-outline w-full" disabled={!isBasicAuth || logLoading} onClick={() => fetchLogs('/admin/user-logins')}>
                        {logLoading ? "Fetching..." : "Fetch User Logins"}
                    </button>
                </div>
            </div>
            <div className="logs-content card">
                <div className="card-header flex-between">
                    <h3>Log Viewer</h3>
                    {logs.length > 0 && <button className="btn-text text-small" onClick={() => setLogs([])}>Clear</button>}
                </div>
                <div className="log-list">
                    {logLoading ? <div className="p-5 text-center text-muted">Loading logs...</div> :
                     logs.length > 0 ? (
                        <div className="table-responsive">
                            <table className="text-small">
                                <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
                                <tbody>
                                    {logs.map((log, i) => (
                                        <tr key={i}>
                                            <td className="text-muted">{log.timestamp || log.created_at}</td>
                                            <td className="fw-bold">{log.username || log.user}</td>
                                            <td><span className="badge-type">{log.action || log.event}</span></td>
                                            <td>{log.details || log.message || JSON.stringify(log)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     ) : (
                        <div className="p-5 text-center text-muted border-dashed">Select a log source to view system data.</div>
                     )}
                </div>
            </div>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="card">
            <div className="card-header"><Trash2 size={20} className="text-danger"/> <h3>Advanced Management</h3></div>
            <p className="mb-4">Use these tools to correct data entry errors. <strong>Basic Auth Only.</strong></p>
            
            {!isBasicAuth ? (
                <div className="empty-state p-4 border-dashed">
                    <Lock size={32} className="text-muted mb-2"/>
                    <h4>Restricted Area</h4>
                    <p className="text-small">Please login as <strong>System Admin</strong> to use these tools.</p>
                </div>
            ) : (
                <div className="management-actions">
                    <div className="action-row flex-between p-3 border-bottom">
                        <div>
                            <div className="fw-bold">Delete Sell Report</div>
                            <div className="text-small text-muted">Permanently remove daily sell data and finance entries.</div>
                        </div>
                        <button className="btn-secondary btn-sm" disabled={actionLoading} onClick={() => {
                            const date = window.prompt("Enter Report Date (YYYY-MM-DD):");
                            if (date) handleDeleteAction(`/admin/reports/sell-reports/${date}`, `Report for ${date}`);
                        }}><Trash2 size={14}/> Delete</button>
                    </div>
                    <div className="action-row flex-between p-3 border-bottom">
                        <div>
                            <div className="fw-bold">Delete Invoice</div>
                            <div className="text-small text-muted">Remove an uploaded invoice and reverse its stock impact.</div>
                        </div>
                        <button className="btn-secondary btn-sm" disabled={actionLoading} onClick={() => {
                            const inv = window.prompt("Enter Invoice Number:");
                            if (inv) handleDeleteAction(`/admin/invoices/${inv}`, `Invoice ${inv}`);
                        }}><Trash2 size={14}/> Delete</button>
                    </div>
                    <div className="action-row flex-between p-3 border-bottom">
                        <div>
                            <div className="fw-bold">Delete Sell Finance</div>
                            <div className="text-small text-muted">Remove only the finance/settlement part of a report.</div>
                        </div>
                        <button className="btn-secondary btn-sm" disabled={actionLoading} onClick={() => {
                            const date = window.prompt("Enter Report Date (YYYY-MM-DD):");
                            if (date) handleDeleteAction(`/admin/sell-finance/${date}`, `Finance for ${date}`);
                        }}><Trash2 size={14}/> Delete</button>
                    </div>
                    <div className="action-row flex-between p-3 border-bottom">
                        <div>
                            <div className="fw-bold">Manual Stock Override</div>
                            <div className="text-small text-muted">Directly modify total cases/bottles for a specific stock ID.</div>
                        </div>
                        <button className="btn-secondary btn-sm" disabled={actionLoading} onClick={handleEditStock}><Edit3 size={14}/> Edit Stock</button>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Admin;
