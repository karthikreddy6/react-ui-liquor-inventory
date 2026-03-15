import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Package, AlertCircle, DollarSign, FileText, CheckCircle, ShoppingCart, BarChart3, Clock, ArrowUpRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import { motion } from "framer-motion";

const DashboardCategory = ({ title, children, icon: Icon }) => (
  <div className="dashboard-category-section mb-5">
    <div className="flex-align-center gap-2 mb-4">
        <div style={{ 
            backgroundColor: 'var(--primary)', 
            width: '3px', 
            height: '1.1rem', 
            borderRadius: '4px' 
        }}></div>
        <h2 style={{ 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            color: '#64748b', 
            margin: 0, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em' 
        }}>
            {title}
        </h2>
    </div>
    <div className="stats-grid">
      {children}
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, subtext, index, onClick }) => (
  <motion.div 
    className="stat-card"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    whileHover={{ y: -4, boxShadow: "0 15px 25px -8px rgba(0, 0, 0, 0.08)" }}
    onClick={onClick}
  >
    <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}10`, color: color }}>
        <Icon size={22} className="stat-icon-svg" />
    </div>

    <div className="stat-content">
      <span className="stat-label">{title}</span>
      <h3 className="stat-value">{value}</h3>
      {subtext && (
        <div className="stat-subtext flex-align-center gap-1 mt-1 text-muted">
            <Clock size={12} />
            <span>{subtext}</span>
        </div>
      )}
    </div>

    {onClick && <ArrowUpRight className="card-arrow" size={16} />}

    <style>{`
        .stat-card {
            background: white;
            border: 1px solid #f1f5f9;
            border-radius: 18px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: ${onClick ? 'pointer' : 'default'};
        }

        /* Computer View */
        @media (min-width: 769px) {
            .stat-card {
                padding: 1.6rem;
                min-height: 155px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .stat-icon-wrapper {
                width: 44px;
                height: 44px;
                border-radius: 11px;
                display: flex;
                align-items: center;
                justifyContent: center;
            }
            .stat-label {
                color: #94a3b8;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: block;
            }
            .stat-value {
                font-size: 1.6rem;
                font-weight: 800;
                color: #0f172a;
                margin: 0.2rem 0;
                letter-spacing: -0.02em;
            }
            .stat-subtext {
                font-size: 0.7rem;
                font-weight: 500;
            }
            .card-arrow {
                position: absolute;
                top: 1.6rem;
                right: 1.6rem;
                color: #cbd5e1;
                opacity: 0;
                transition: all 0.3s;
            }
            .stat-card:hover .card-arrow {
                opacity: 1;
                transform: translate(2px, -2px);
                color: var(--primary);
            }
            .stats-grid { 
                display: grid; 
                grid-template-columns: repeat(3, 1fr); 
                gap: 1.5rem; 
            }
        }

        /* Mobile View */
        @media (max-width: 768px) {
            .stat-card {
                padding: 1rem 1.25rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .stat-icon-wrapper {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justifyContent: center;
                order: 2;
            }
            .stat-content {
                order: 1;
                flex: 1;
            }
            .stat-label {
                color: #94a3b8;
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
                display: block;
            }
            .stat-value {
                font-size: 1.25rem;
                font-weight: 800;
                color: #0f172a;
                margin: 0.1rem 0;
            }
            .stat-subtext {
                font-size: 0.65rem;
            }
            .card-arrow { display: none; }
            .stats-grid { 
                display: grid; 
                grid-template-columns: 1fr; 
                gap: 0.75rem; 
            }
        }

        .dashboard-page {
            max-width: 1400px;
            margin: 0 auto;
        }
    `}</style>
  </motion.div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(user?.summary || {});
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [resSum, resFin] = await Promise.all([
            fetch(`${API_BASE}/dashboard/summary`, { headers: { "Authorization": token } }),
            fetch(`${API_BASE}/seller/sell-finance/overview`, { headers: { Authorization: token } })
        ]);

        if (resSum.ok) setSummary(await resSum.json());
        if (resFin.ok) setFinance(await resFin.json());
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role && user.role !== "seller") {
      fetchDashboardData();
    } else {
        setLoading(false);
    }
  }, [token, user]);

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN"), []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="dashboard-page dashboard-view">
      <header className="page-header mb-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Welcome, <span className="text-primary">{user?.name || "User"}</span>
            </h1>
            <p className="text-muted" style={{ fontSize: '0.95rem' }}>Here's what's happening in your warehouse today.</p>
        </motion.div>
      </header>

      {/* CATEGORY: PRESENT */}
      <DashboardCategory title="Present Status" icon={Package}>
        <StatCard 
            title="Present Stock" 
            value={`${number.format(summary.total_present_stock || 0)} Cases`} 
            icon={Package} 
            color="#3b82f6" 
            subtext="Available Inventory"
            onClick={() => navigate("/stock")}
            index={0}
        />
        <StatCard 
            title="Present Stock MRP" 
            value={currency.format(summary.total_present_stock_mrp_value || 0)} 
            icon={DollarSign} 
            color="#10b981" 
            subtext="Current Stock Valuation"
            onClick={() => navigate("/stock")}
            index={1}
        />
      </DashboardCategory>

      {/* CATEGORY: LAST SELL */}
      <DashboardCategory title="Latest Sell" icon={ShoppingCart}>
        <StatCard 
            title="Last Sell Date" 
            value={formatDate(summary.last_sell_report_date)} 
            icon={Clock} 
            color="#f59e0b" 
            subtext="Recent Sales Record"
            onClick={() => navigate("/sell-report")}
            index={2}
        />
        <StatCard 
            title="Last Sell MRP" 
            value={currency.format(summary.last_sell_report_value || 0)} 
            icon={TrendingUp} 
            color="#f59e0b" 
            subtext="Gross Sales Amount"
            onClick={() => navigate("/sell-report")}
            index={3}
        />
      </DashboardCategory>

      {/* CATEGORY: LAST INVOICE */}
      <DashboardCategory title="Latest Invoice (Purchase)" icon={FileText}>
        <StatCard 
            title="Last Invoice Date" 
            value={formatDate(summary.last_invoice_date)} 
            icon={FileText} 
            color="#6366f1" 
            subtext={`Inv: ${summary.last_invoice_number || finance?.latest_invoice?.invoice_number || 'N/A'}`}
            onClick={() => navigate("/invoice")}
            index={4}
        />
        <StatCard 
            title="Last Invoice Value" 
            value={currency.format(summary.last_invoice_value || 0)} 
            icon={DollarSign} 
            color="#6366f1" 
            subtext="Total Purchase Amount"
            onClick={() => navigate("/invoice")}
            index={5}
        />
        <StatCard 
            title="Updated Brands" 
            value={summary.last_invoice_brands_count || finance?.latest_invoice?.brands_count || "N/A"} 
            icon={CheckCircle} 
            color="#6366f1" 
            subtext="Brands in Last Invoice"
            onClick={() => navigate("/invoice")}
            index={6}
        />
      </DashboardCategory>

      {/* CATEGORY: TOTAL */}
      <DashboardCategory title="Cumulative Totals" icon={BarChart3}>
        <StatCard 
            title="Total Sell MRP" 
            value={currency.format(summary.total_sell_mrp || finance?.totals?.all_sell_amount || 0)} 
            icon={BarChart3} 
            color="#ec4899" 
            subtext="All-time Sales Value"
            onClick={() => navigate("/finance")}
            index={7}
        />
        <StatCard 
            title="Total Invoices Value" 
            value={currency.format(summary.total_invoices_value || finance?.totals?.all_invoices_total_invoice_value || 0)} 
            icon={FileText} 
            color="#8b5cf6" 
            subtext="All-time Purchase Value"
            onClick={() => navigate("/finance")}
            index={8}
        />
        <StatCard 
            title="Total Uncleared Balance" 
            value={currency.format(summary.total_uncleared_balance || summary.last_uncleared_amount || 0)} 
            icon={ (summary.total_uncleared_balance || summary.last_uncleared_amount) > 0 ? AlertCircle : CheckCircle} 
            color={(summary.total_uncleared_balance || summary.last_uncleared_amount) > 0 ? "#ef4444" : "#10b981"} 
            subtext={(summary.total_uncleared_balance || summary.last_uncleared_amount) > 0 ? "Pending Settlement" : "All Settled"}
            onClick={() => navigate("/finance")}
            index={9}
        />
      </DashboardCategory>
    </div>
  );
};

export default Dashboard;
