import React, { useState } from "react";
import { TrendingDown, TrendingUp, BarChart3, Info, Search } from "lucide-react";
import { getCoverageColor, getStockLevelColor, getGapColor } from "./AnalysisUtils";

const StockTables = ({ stock }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="main-col">
      {/* 1. LOW STOCK TABLE */}
      <section className="card table-card mb-4 border-top-danger">
        <div className="card-header-accent flex-between">
          <div className="flex-align-center gap-2">
            <TrendingDown size={18} className="text-danger" />
            <h3>Inventory Shortage (Low Stock)</h3>
          </div>
          <span className="text-small text-muted italic">Demand-based reorder required</span>
        </div>
        <div className="p-2 bg-light-hint">
          <p className="text-xs text-muted mb-0 px-2">
            <Info size={12} className="mr-1" />
            Low stock is calculated based on recent sales demand, not just current bottle count.
          </p>
        </div>
        <div className="table-responsive">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th className="text-center">Current</th>
                <th className="text-center">Latest Sold</th>
                <th className="text-center highlight-cell">Required</th>
                <th className="text-center">Shortage</th>
                <th className="text-center">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {stock.low_stock.length > 0 ? stock.low_stock.map((item, i) => (
                <tr key={item.id || i}>
                  <td>
                    <div className="fw-bold">{item.brand_name}</div>
                    <div className="text-xs text-muted">{item.pack_size_quantity_ml}ml • #{item.brand_number}</div>
                  </td>
                  <td className="text-center">{item.total_bottles} Bt</td>
                  <td className="text-center fw-bold">{item.latest_sold_bottles}</td>
                  <td className="text-center highlight-cell text-primary fw-bold">{item.required_stock_bottles} Bt</td>
                  <td className="text-center text-danger fw-bold">-{item.shortage_bottles} Bt</td>
                  <td className={`text-center ${getCoverageColor(item.coverage_ratio)}`}>
                    {((item.coverage_ratio || 0) * 100).toFixed(0)}%
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No critical low stock detected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. HIGH STOCK TABLE */}
      <section className="card table-card mb-4 border-top-info">
        <div className="card-header-accent flex-between">
          <div className="flex-align-center gap-2">
            <TrendingUp size={18} className="text-info" />
            <h3>Excess Inventory (High Stock)</h3>
          </div>
        </div>
        <div className="table-responsive">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th className="text-center">Current</th>
                <th className="text-center highlight-cell">Required</th>
                <th className="text-center">Excess</th>
                <th className="text-center">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {stock.high_stock.length > 0 ? stock.high_stock.map((item, i) => (
                <tr key={item.id || i}>
                  <td>
                    <div className="fw-bold">{item.brand_name}</div>
                    <div className="text-xs text-muted">{item.pack_size_quantity_ml}ml</div>
                  </td>
                  <td className="text-center">{item.total_bottles} Bt</td>
                  <td className="text-center highlight-cell text-primary fw-bold">{item.required_stock_bottles} Bt</td>
                  <td className="text-center text-info fw-bold">+{item.excess_bottles} Bt</td>
                  <td className={`text-center ${getCoverageColor(item.coverage_ratio)}`}>
                    {(item.coverage_ratio || 0).toFixed(1)}x
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No high stock excess detected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. FULL PREDICTION AUDIT */}
      <section className="card table-card">
         <div className="card-header-accent flex-between">
            <div className="flex-align-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3>Full Prediction & Demand Audit</h3>
            </div>
            <div className="search-pill compact">
               <Search size={14} />
               <input 
                  type="text" 
                  placeholder="Search brands..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
               />
            </div>
         </div>
         <div className="table-responsive master-scroll">
            <table className="analysis-table master">
               <thead>
                  <tr>
                     <th>Brand Name</th>
                     <th className="text-center">Current</th>
                     <th className="text-center highlight-cell">Required</th>
                     <th className="text-center">Gap (Bt)</th>
                     <th className="text-center">Level</th>
                  </tr>
               </thead>
               <tbody>
                  {stock.predictions
                    .filter(item => item.brand_name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item, i) => (
                     <tr key={item.id || i}>
                        <td>
                           <div className="fw-bold">{item.brand_name}</div>
                           <div className="text-xs text-muted">#{item.brand_number}</div>
                        </td>
                        <td className="text-center">{item.total_bottles}</td>
                        <td className="text-center highlight-cell text-danger fw-bold">{item.required_stock_bottles}</td>
                        <td className={`text-center fw-bold ${getGapColor(item.stock_gap_bottles)}`}>
                           {item.stock_gap_bottles > 0 ? `+${item.excess_bottles}` : item.shortage_bottles ? `-${item.shortage_bottles}` : '0'}
                        </td>
                        <td className="text-center">
                           <span className={`badge-status ${getStockLevelColor(item.stock_level)}`}>
                              {item.stock_level.toUpperCase()}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  );
};

export default StockTables;
