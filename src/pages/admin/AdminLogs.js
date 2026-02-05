import React, { useState } from "react";
import { List, User, AlertCircle, Lock } from "lucide-react";
import { API_BASE } from "../../apiConfig";

const AdminLogs = ({ token, isBasicAuth }) => {
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

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

  return (
    <div className="admin-grid logs-grid fade-in">
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
                        <td className="text-muted">{log.timestamp || log.created_at || log.last_login_at}</td>
                        <td className="fw-bold">{log.username || log.user}</td>
                        <td><span className="badge-type">{log.action || log.event || 'LOGIN'}</span></td>
                        <td>{log.details || log.message || log.role || JSON.stringify(log)}</td>
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
  );
};

export default AdminLogs;
