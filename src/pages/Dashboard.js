import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, AlertCircle, DollarSign } from "lucide-react";

const data = [
  { name: 'Jan', stock: 4000, sales: 2400 },
  { name: 'Feb', stock: 3000, sales: 1398 },
  { name: 'Mar', stock: 2000, sales: 9800 },
  { name: 'Apr', stock: 2780, sales: 3908 },
  { name: 'May', stock: 1890, sales: 4800 },
  { name: 'Jun', stock: 2390, sales: 3800 },
  { name: 'Jul', stock: 3490, sales: 4300 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="stat-info">
      <span className="stat-title">{title}</span>
      <h3 className="stat-value">{value}</h3>
    </div>
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = () => {
  // In a real app, you'd fetch this data from your API
  const [stats, setStats] = useState({
    totalStock: "12,450",
    revenue: "₹ 4.2L",
    lowStock: "5 Items",
    pendingOrders: "12"
  });

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome to your inventory command center.</p>
      </header>

      <div className="stats-grid">
        <StatCard title="Total Stock" value={stats.totalStock} icon={Package} color="#3b82f6" />
        <StatCard title="Total Revenue" value={stats.revenue} icon={DollarSign} color="#10b981" />
        <StatCard title="Low Stock Alerts" value={stats.lowStock} icon={AlertCircle} color="#ef4444" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon={TrendingUp} color="#f59e0b" />
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Stock vs Sales Trends</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
