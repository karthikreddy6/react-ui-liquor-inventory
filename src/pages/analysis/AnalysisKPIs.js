import React from "react";
import { AlertTriangle, Package, TrendingUp, Wallet } from "lucide-react";
import { currencyFormatter, numberFormatter } from "./AnalysisUtils";

const AnalysisKPIs = ({ stockSummary, financeSummary }) => (
  <div className="kpi-grid-5 mb-4">
    <div className="card kpi-card border-left-danger">
      <div className="kpi-head">
         <div className="kpi-icon red"><AlertTriangle size={20}/></div>
         <span className="kpi-label">Shortage</span>
      </div>
      <div className="kpi-value text-danger">{numberFormatter.format(stockSummary.total_shortage_bottles || 0)} <small style={{fontSize: '0.7rem'}}>Bt</small></div>
      <div className="kpi-subtext">Immediate restock needed</div>
    </div>
    
    <div className="card kpi-card border-left-info">
      <div className="kpi-head">
         <div className="kpi-icon blue"><Package size={20}/></div>
         <span className="kpi-label">Total Items</span>
      </div>
      <div className="kpi-value text-info">{numberFormatter.format(stockSummary.total_items || 0)}</div>
      <div className="kpi-subtext">{stockSummary.normal_stock_count} Brands at normal level</div>
    </div>

    <div className="card kpi-card border-left-success">
      <div className="kpi-head">
         <div className="kpi-icon green"><TrendingUp size={20}/></div>
         <span className="kpi-label">Stock Value</span>
      </div>
      <div className="kpi-value">{currencyFormatter.format(stockSummary.total_stock_amount)}</div>
      <div className="kpi-subtext">Total warehouse asset value</div>
    </div>

    <div className="card kpi-card border-left-primary">
      <div className="kpi-head">
         <div className="kpi-icon purple"><Wallet size={20}/></div>
         <span className="kpi-label">Settlement</span>
      </div>
      <div className={`kpi-value ${financeSummary.latest_final_balance < 0 ? 'text-danger' : 'text-success'}`}>
        {currencyFormatter.format(financeSummary.latest_final_balance || 0)}
      </div>
      <div className="kpi-subtext">Last daily settlement gap</div>
    </div>

    <div className="card kpi-card border-left-orange">
      <div className="kpi-head">
         <div className="kpi-icon orange" style={{ background: '#fff7ed', color: '#ea580c' }}><AlertTriangle size={20}/></div>
         <span className="kpi-label">Out of Stock</span>
      </div>
      <div className="kpi-value" style={{ color: '#ea580c' }}>{stockSummary.zero_stock_count || 0}</div>
      <div className="kpi-subtext">Items with zero inventory</div>
    </div>
  </div>
);

export default AnalysisKPIs;
