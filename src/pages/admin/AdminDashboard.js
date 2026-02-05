import React from "react";
import { Clock, Database, Server, FileText } from "lucide-react";

const AdminDashboard = ({ adminData }) => {
  return (
    <div className="admin-grid fade-in">
      {/* Metric 1: System Status */}
      <div className="card simple-metric">
        <div className="flex-between align-center">
          <div>
            <div className="label">Server Status</div>
            <div className="value text-success">Online</div>
          </div>
          <div className="stat-icon bg-green-100 text-green-600"><Server size={24}/></div>
        </div>
      </div>

      {/* Metric 2: Inventory Size */}
      <div className="card simple-metric">
        <div className="flex-between align-center">
          <div>
            <div className="label">Total Stock Items</div>
            <div className="value">{adminData?.stock_count || 0}</div>
          </div>
          <div className="stat-icon bg-blue-100 text-blue-600"><Database size={24}/></div>
        </div>
      </div>

      {/* Metric 3: Invoice Count */}
      <div className="card simple-metric">
        <div className="flex-between align-center">
          <div>
            <div className="label">Total Invoices</div>
            <div className="value">{adminData?.invoice_count || 0}</div>
          </div>
          <div className="stat-icon bg-purple-100 text-purple-600"><FileText size={24}/></div>
        </div>
      </div>

      {/* Metric 4: Uptime */}
      <div className="card simple-metric">
        <div className="flex-between align-center">
          <div>
            <div className="label">System Uptime</div>
            <div className="value">{Math.floor((adminData?.uptime_seconds || 0) / 60)} min</div>
          </div>
          <div className="stat-icon bg-orange-100 text-orange-600"><Clock size={24}/></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
