import React from "react";
import { User, Shield, Key } from "lucide-react";

const Admin = () => {
  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Admin Settings</h1>
        <p className="text-muted">Manage system users and configurations.</p>
      </header>

      <div className="admin-grid">
        <div className="card">
          <div className="card-header">
            <User size={20} className="icon" />
            <h3>User Management</h3>
          </div>
          <p>Add, remove, or modify user access levels.</p>
          <button className="btn-outline">Manage Users</button>
        </div>

        <div className="card">
          <div className="card-header">
            <Shield size={20} className="icon" />
            <h3>Security Settings</h3>
          </div>
          <p>Configure password policies and session timeouts.</p>
          <button className="btn-outline">Security Config</button>
        </div>

        <div className="card">
          <div className="card-header">
            <Key size={20} className="icon" />
            <h3>API Keys</h3>
          </div>
          <p>Manage API keys for external integrations.</p>
          <button className="btn-outline">View Keys</button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
