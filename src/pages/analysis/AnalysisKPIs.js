import React from "react";
import { AlertTriangle, Package, TrendingUp, Wallet } from "lucide-react";
import { currencyFormatter, numberFormatter } from "./AnalysisUtils";

const AnalysisKPIs = ({ stockSummary, financeSummary }) => (
  <div className="kpi-grid mb-4">
    <div className="card kpi-card border-left-danger">
      <div className="kpi-head">
         <div className="kpi-icon red"><AlertTriangle size={20}/></div>
         <span className="kpi-label">Shortage Alert</span>
      </div>
      <div className="kpi-value text-danger">{numberFormatter.format(stockSummary.total_shortage_bottles || 0)} <small style={{fontSize: '0.8rem'}}>Bt</small></div>
      <div className="kpi-subtext">Total bottles needed immediately</div>
    </div>
    
    <div className="card kpi-card border-left-info">
      <div className="kpi-head">
         <div className="kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Package size={20}/></div>
         <span className="kpi-label">Required Inventory</span>
      </div>
      <div className="kpi-value" style={{ color: '#ef4444' }}>{numberFormatter.format(stockSummary.total_required_stock_bottles || 0)} <small style={{fontSize: '0.8rem'}}>Bt</small></div>
      <div className="kpi-subtext">Optimal stock for current demand</div>
    </div>

    <div className="card kpi-card border-left-success">
      <div className="kpi-head">
         <div className="kpi-icon green"><TrendingUp size={20}/></div>
         <span className="kpi-label">Stock Valuation</span>
      </div>
      <div className="kpi-value">{currencyFormatter.format(stockSummary.total_stock_amount)}</div>
      <div className="kpi-subtext">Current asset value in warehouse</div>
    </div>

    <div className="card kpi-card border-left-primary">
      <div className="kpi-head">
         <div className="kpi-icon purple"><Wallet size={20}/></div>
         <span className="kpi-label">Latest Audit</span>
      </div>
      <div className={`kpi-value ${financeSummary.latest_final_balance < 0 ? 'text-danger' : 'text-success'}`}>
        {currencyFormatter.format(financeSummary.latest_final_balance)}
      </div>
      <div className="kpi-subtext">Last explained settlement gap</div>
    </div>
  </div>
);

export default AnalysisKPIs;
