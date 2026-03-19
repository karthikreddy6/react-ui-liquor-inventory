import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, Package, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import { toast } from "react-hot-toast";

// Modular Components
import AnalysisKPIs from "./analysis/AnalysisKPIs";
import AnalysisAlerts from "./analysis/AnalysisAlerts";
import RequiredStockTable from "./analysis/RequiredStockTable";
import StockTables from "./analysis/StockTables";
import FinancePanel from "./analysis/FinancePanel";
import FinanceAnalytics from "./analysis/FinanceAnalytics";

const Analytics = () => {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("stock"); // stock, finance
  
  // Filter States
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [highStockThreshold, setHighStockThreshold] = useState("");

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_BASE}/seller/analysis/overview`;
      const params = new URLSearchParams();
      if (lowStockThreshold) params.append("low_stock_cases", lowStockThreshold);
      if (highStockThreshold) params.append("high_stock_cases", highStockThreshold);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url, { 
        headers: { 
          "Authorization": token,
          "Content-Type": "application/json"
        } 
      });

      if (res.status === 401) { logout(); return; }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch analysis data");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, lowStockThreshold, highStockThreshold]);

  useEffect(() => {
    if (token) fetchAnalysis();
  }, [token, fetchAnalysis]);

  if (loading) return (
    <div className="flex-center" style={{ height: '80vh' }}>
      <div className="loader-container">
        <RefreshCw className="spin text-primary" size={48} />
        <p className="mt-3 fw-bold text-muted">Running Business Intelligence Audit...</p>
      </div>
    </div>
  );

  if (!analysis) return <div className="p-5 text-center text-muted">No analysis data available.</div>;

  return (
    <div className="analysis-dashboard fade-in">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Business Intelligence</h1>
            <p className="text-muted">Generated as of {analysis.generated_at.split('T')[0]}</p>
          </div>
          
          <div className="flex-gap">
            <div className="btn-group" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button 
                className={`btn-toggle-small ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => setActiveTab('stock')}
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'stock' ? 'white' : 'transparent', boxShadow: activeTab === 'stock' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Package size={16} /> Stock
              </button>
              <button 
                className={`btn-toggle-small ${activeTab === 'finance' ? 'active' : ''}`}
                onClick={() => setActiveTab('finance')}
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'finance' ? 'white' : 'transparent', boxShadow: activeTab === 'finance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Wallet size={16} /> Finance
              </button>
            </div>

            <div className="flex-gap align-center ml-2" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                   <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>LOW (CS)</label>
                   <input 
                      type="number" 
                      className="form-control compact"
                      style={{ width: '70px', padding: '2px 8px' }}
                      value={lowStockThreshold} 
                      placeholder={analysis.thresholds?.low_stock_cases || "2"}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                   />
                </div>
                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column' }}>
                   <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>HIGH (CS)</label>
                   <input 
                      type="number" 
                      className="form-control compact"
                      style={{ width: '70px', padding: '2px 8px' }}
                      value={highStockThreshold} 
                      placeholder={analysis.thresholds?.high_stock_cases || "25"}
                      onChange={(e) => setHighStockThreshold(e.target.value)}
                   />
                </div>
                <button className="btn-secondary" onClick={fetchAnalysis} title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>
          </div>
        </div>
      </header>

      {error && <div className="error-banner mb-4"><AlertCircle size={18} /> {error}</div>}

      {activeTab === "stock" ? (
        <div className="stock-analysis-tab">
          <AnalysisKPIs stockSummary={analysis.stock.summary} financeSummary={analysis.finance.summary} />
          <RequiredStockTable requiredStock={analysis.stock.required_stock} />
          <AnalysisAlerts messages={analysis.messages} />
          <div className="analysis-main-layout">
            <StockTables stock={analysis.stock} />
            <FinancePanel finance={analysis.finance} />
          </div>
        </div>
      ) : (
        <FinanceAnalytics finance={analysis.finance} summary={analysis.stock.summary} />
      )}

      <style>{`
         .analysis-dashboard { 
            max-width: 1600px; 
            margin: 0 auto; 
            padding: 1rem;
            min-height: 100vh;
         }

         /* Standardized UI Overrides to maintain density without "Premium" specific classes */
         .kpi-grid, .kpi-grid-5 { display: grid; gap: 1rem; margin-bottom: 1.5rem; }
         .kpi-grid { grid-template-columns: repeat(4, 1fr); }
         .kpi-grid-5 { grid-template-columns: repeat(5, 1fr); }

         .kpi-card { 
            background: white; padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 12px; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
         }
         .kpi-head { display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem; }
         .kpi-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
         .kpi-icon svg { width: 20px; height: 20px; }
         .kpi-icon.purple { background: #f5f3ff; color: #8b5cf6; }
         .kpi-icon.blue { background: #eff6ff; color: #3b82f6; }
         .kpi-icon.green { background: #f0fdf4; color: #10b981; }
         .kpi-icon.orange { background: #fff7ed; color: #f97316; }
         
         .kpi-label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
         .kpi-value { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
         .kpi-subtext { font-size: 0.75rem; color: #94a3b8; }

         .message-area { 
            background: white; border: 1px solid #e2e8f0; border-radius: 12px; 
            margin-bottom: 1.5rem; overflow: hidden;
         }
         .msg-box { 
            display: flex; align-items: center; gap: 10px; padding: 0.75rem 1.25rem; 
            border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; 
         }

         .analysis-main-layout { display: grid; grid-template-columns: 1fr 350px; gap: 1.5rem; align-items: start; }
         
         .card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
         .card-header-accent { 
            padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; 
            align-items: center; gap: 10px;
         }
         .card-header-accent h3 { font-size: 1rem; font-weight: 700; margin: 0; }
         
         .analysis-table th { 
            background: #f8fafc; padding: 0.75rem 1.25rem; 
            font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase;
         }
         .analysis-table td { padding: 1rem 1.25rem; font-size: 0.9rem; border-bottom: 1px solid #f8fafc; }
         
         .master-scroll { max-height: 700px; overflow-y: auto; }
         .badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; }

         @media (max-width: 1400px) {
            .analysis-main-layout { grid-template-columns: 1fr; }
            .kpi-grid, .kpi-grid-5 { grid-template-columns: repeat(2, 1fr); }
         }
         @media (max-width: 600px) {
            .kpi-grid, .kpi-grid-5 { grid-template-columns: 1fr; }
         }
      `}</style>
    </div>
  );
};

export default Analytics;
