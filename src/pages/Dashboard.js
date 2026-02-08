import React, { useMemo, useState, useEffect } from "react";
import { TrendingUp, Package, AlertCircle, DollarSign, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, color, subtext, index }) => (
  <motion.div 
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
  >
    <div className="stat-info">
      <span className="stat-title">{title}</span>
      <h3 className="stat-value">{value}</h3>
      {subtext && <p className="text-small text-muted mt-1">{subtext}</p>}
    </div>
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
      <Icon size={24} />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState(user?.summary || {});

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: { "Authorization": token }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
      }
    };

    if (user?.role === "owner" || user?.role === "supervisor") {
      fetchSummary();
    }
  }, [token, user]);

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN"), []);

  const stats = [
    { title: "Stock MRP Value", value: currency.format(summary.total_present_stock_mrp_value || 0), icon: DollarSign, color: "#10b981" },
    { title: "Available Stock (cases)", value: number.format(summary.total_present_stock || 0), icon: Package, color: "#3b82f6", subtext: "Across all brands" },
    { title: "Last Sell Report", value: currency.format(summary.last_sell_report_value || 0), icon: TrendingUp, color: "#f59e0b", subtext: `Date: ${summary.last_sell_report_date || 'N/A'}` },
    { title: "Last Invoice Value", value: currency.format(summary.last_invoice_value || 0), icon: FileText, color: "#6366f1", subtext: `Date: ${summary.last_invoice_date || 'N/A'}` },
    { title: "Uncleared Balance", value: currency.format(summary.last_uncleared_amount || 0), icon: summary.last_uncleared_amount > 0 ? AlertCircle : CheckCircle, color: summary.last_uncleared_amount > 0 ? "#ef4444" : "#10b981", subtext: summary.last_uncleared_amount > 0 ? "Settlement Pending" : "" }
  ];

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
            <h1>Dashboard Overview</h1>
            <p className="text-muted">Welcome back, {user?.name || "User"}</p>
        </motion.div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
