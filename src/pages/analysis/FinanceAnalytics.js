import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { DollarSign, TrendingUp, Wallet, Activity } from "lucide-react";
import { currencyFormatter } from "./AnalysisUtils";

const FinanceAnalytics = ({ finance, summary }) => {
  // 1. Process Trends & Calculate Aggregates (Ultra-Robust)
  const { trends, totals, reportDays } = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Start totals with the latest known record (which we know is working)
    const latest = finance.latest_finance || {};
    let sumSales = Number(latest.total_sell_amount || latest.total_amount || 0);
    let sumCash = Number(latest.cash || 0);
    let sumUpi = Number(latest.upi_phonepay || 0);
    
    // Build a unique set of reports for trends and additional summation
    const reportsMap = new Map();
    if (latest.report_date) reportsMap.set(latest.report_date, latest);
    
    (finance.recent_finance || []).forEach(f => {
      if (!reportsMap.has(f.report_date)) {
        reportsMap.set(f.report_date, f);
        // Add to totals if it's a new unique date
        sumSales += Number(f.total_sell_amount || f.total_amount || 0);
        sumCash += Number(f.cash || 0);
        sumUpi += Number(f.upi_phonepay || 0);
      }
    });

    const uniqueReports = Array.from(reportsMap.values());

    const processedTrends = uniqueReports
      .sort((a, b) => new Date(a.report_date) - new Date(b.report_date))
      .map(f => {
        const parts = f.report_date.split('-');
        let dateLabel = f.report_date;
        if (parts.length === 3) {
            const day = parts[2].padStart(2, '0');
            const month = monthNames[parseInt(parts[1]) - 1];
            dateLabel = `${day}-${month}`;
        }
        
        return {
          date: dateLabel,
          sales: Number(f.total_sell_amount || f.total_amount || 0),
          balance: Number(f.final_balance || 0),
          collected: Number(f.cash || 0) + Number(f.upi_phonepay || 0)
        };
      });

    return { 
      trends: processedTrends, 
      totals: { sales: sumSales, cash: sumCash, upi: sumUpi },
      reportDays: Math.max(uniqueReports.length, finance.summary?.sell_report_days || 1)
    };
  }, [finance]);

  // Priority Data Extraction
  const displaySales = Math.max(totals.sales, Number(finance.summary?.total_sell_amount || 0));
  const displayPurchases = Number(finance.summary?.total_invoice_value || summary?.total_present_stock_mrp_value || 0);
  const displayCash = Math.max(totals.cash, Number(finance.summary?.cash || 0));
  const displayUpi = Math.max(totals.upi, Number(finance.summary?.upi_phonepay || 0));

  return (
    <div className="finance-analytics-view fade-in">
      {/* 1. Lifetime Summary Grid */}
      <div className="kpi-grid-5 mb-4">
         <div className="card kpi-card">
            <div className="kpi-head">
               <div className="kpi-icon purple"><TrendingUp size={20}/></div>
               <span className="kpi-label">Total Sales</span>
            </div>
            <div className="kpi-value">{currencyFormatter.format(displaySales)}</div>
            <div className="kpi-subtext">Cumulative revenue</div>
         </div>
         <div className="card kpi-card">
            <div className="kpi-head">
               <div className="kpi-icon blue"><Wallet size={20}/></div>
               <span className="kpi-label">Stock Valuation</span>
            </div>
            <div className="kpi-value">{currencyFormatter.format(displayPurchases)}</div>
            <div className="kpi-subtext">Current asset value</div>
         </div>
         <div className="card kpi-card">
            <div className="kpi-head">
               <div className="kpi-icon green"><DollarSign size={20}/></div>
               <span className="kpi-label">Cash Revenue</span>
            </div>
            <div className="kpi-value">{currencyFormatter.format(displayCash)}</div>
            <div className="kpi-subtext">Physical collections</div>
         </div>
         <div className="card kpi-card">
            <div className="kpi-head">
               <div className="kpi-icon light-blue" style={{ background: '#e0f2fe', color: '#0284c7' }}><Activity size={20}/></div>
               <span className="kpi-label">UPI Revenue</span>
            </div>
            <div className="kpi-value" style={{ color: '#0284c7' }}>{currencyFormatter.format(displayUpi)}</div>
            <div className="kpi-subtext">Digital collections</div>
         </div>
         <div className="card kpi-card">
            <div className="kpi-head">
               <div className="kpi-icon orange"><Activity size={20}/></div>
               <span className="kpi-label">Avg Daily Sales</span>
            </div>
            <div className="kpi-value">
              {currencyFormatter.format(displaySales / reportDays)}
            </div>
            <div className="kpi-subtext">Across {reportDays} active days</div>
         </div>
      </div>

      <div className="charts-main-grid mb-4">
         <div className="card chart-card">
            <div className="card-header-accent">
               <TrendingUp size={18} className="text-primary" />
               <h3>Daily Sales Performance (Trend)</h3>
            </div>
            <div style={{ height: '350px', width: '100%', padding: '1rem' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                     <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val) => currencyFormatter.format(val)}
                     />
                     <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="card chart-card">
            <div className="card-header-accent">
               <Activity size={18} className="text-danger" />
               <h3>Audit Gap (Shortage/Surplus)</h3>
            </div>
            <div style={{ height: '350px', width: '100%', padding: '1rem' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val) => currencyFormatter.format(val)}
                     />
                     <Bar dataKey="balance" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="charts-main-grid">
         <div className="card chart-card">
            <div className="card-header-accent">
               <DollarSign size={18} className="text-success" />
               <h3>Collection Efficiency (Target vs Collected)</h3>
            </div>
            <div style={{ height: '350px', width: '100%', padding: '1rem' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="date" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val) => currencyFormatter.format(val)}
                     />
                     <Legend />
                     <Bar dataKey="sales" name="Target Sales" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                     <Bar dataKey="collected" name="Total Collected" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="card table-card">
            <div className="card-header-accent">
               <Activity size={18} className="text-primary" />
               <h3>Recent Audit Summary</h3>
            </div>
            <div className="table-responsive">
               <table className="analysis-table compact">
                  <thead>
                     <tr>
                        <th>Date</th>
                        <th className="text-right">Sales</th>
                        <th className="text-right">Balance</th>
                        <th>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {[...trends].reverse().map((t, i) => (
                        <tr key={i}>
                           <td className="fw-bold">{t.date}</td>
                           <td className="text-right">{currencyFormatter.format(t.sales)}</td>
                           <td className={`text-right fw-bold ${t.balance < 0 ? 'text-danger' : 'text-success'}`}>{t.balance}</td>
                           <td>
                              <span className={`badge-status ${Math.abs(t.balance) < 10 ? 'bg-success-light' : 'bg-danger-light'}`}>
                                 {Math.abs(t.balance) < 10 ? "CLEAN" : "GAP"}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <style>{`
         .charts-main-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
         .chart-card { min-height: 450px; }
         @media (max-width: 1024px) { .charts-main-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default FinanceAnalytics;
