import React, { useMemo, useState, useEffect } from "react";
import { TrendingUp, Package, AlertCircle, DollarSign, FileText, CheckCircle, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://192.168.1.114:5000";

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="stat-card">
    <div className="stat-info">
      <span className="stat-title">{title}</span>
      <h3 className="stat-value">{value}</h3>
      {subtext && <p className="text-small text-muted mt-1">{subtext}</p>}
    </div>
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
      <Icon size={24} />
    </div>
  </div>
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

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
            <h1>Dashboard Overview</h1>
            <p className="text-muted">Welcome back, {user?.name || "User"}</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard 
            title="Stock MRP Value" 
            value={currency.format(summary.total_present_stock_mrp_value || 0)} 
            icon={DollarSign} 
            color="#10b981" 
        />
        <StatCard 
            title="Available Stock (cases)" 
            value={number.format(summary.total_present_stock || 0)} 
            icon={Package} 
            color="#3b82f6" 
            subtext="Across all brands"
        />
        <StatCard 
            title="Last Sell Report" 
            value={currency.format(summary.last_sell_report_value || 0)} 
            icon={TrendingUp} 
            color="#f59e0b" 
            subtext={`Date: ${summary.last_sell_report_date || 'N/A'}`}
        />
        <StatCard 
            title="Last Invoice Value" 
            value={currency.format(summary.last_invoice_value || 0)} 
            icon={FileText} 
            color="#6366f1"
            subtext={`Date: ${summary.last_invoice_date || 'N/A'} ${summary.last_invoice_number ? `(#${summary.last_invoice_number})` : ''}`}
        />
        {/* <StatCard 
            title="Retailer Credit Balance" 
            value={currency.format(summary.last_invoice_retailer_credit_balance || 0)} 
            icon={Wallet} 
            color="#8b5cf6" 
            subtext="Available Credit"
        /> */}
        <StatCard 
            title="Uncleared Balance"  
            value={currency.format(summary.last_uncleared_amount || 0)} 
            icon={summary.last_uncleared_amount > 0 ? AlertCircle : CheckCircle} 
            color={summary.last_uncleared_amount > 0 ? "#ef4444" : "#10b981"} 
            subtext={summary.last_uncleared_amount > 0 ? "Settlement Pending" : "All Clear"}
        />
      </div>
    </div>
  );
};

export default Dashboard;
