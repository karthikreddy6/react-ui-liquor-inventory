import React from "react";
import { TrendingDown, TrendingUp, AlertCircle, Info } from "lucide-react";
import { getCoverageColor } from "./AnalysisUtils";

const InventoryAnalysis = ({ stock }) => {
  return (
    <div className="inventory-analysis-view fade-in">
      <div className="analysis-grid">
        {/* 1. LOW STOCK TABLE */}
        <section className="card table-card mb-4 border-top-danger">
          <div className="card-header-accent flex-between">
            <div className="flex-align-center gap-2">
              <TrendingDown size={18} className="text-danger" />
              <h3>Inventory Shortage (Low Stock)</h3>
            </div>
            <span className="badge-status bg-red-100 text-danger">{stock.low_stock.length} Items</span>
          </div>
          <div className="table-responsive">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th className="text-center">Current</th>
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
                    <td className="text-center highlight-cell text-primary fw-bold">{item.required_stock_bottles} Bt</td>
                    <td className="text-center text-danger fw-bold">-{item.shortage_bottles} Bt</td>
                    <td className={`text-center ${getCoverageColor(item.coverage_ratio)}`}>
                      {((item.coverage_ratio || 0) * 100).toFixed(0)}%
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No items are currently below demand threshold.</td></tr>
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
            <span className="badge-status bg-blue-100 text-info">{stock.high_stock.length} Items</span>
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
                      <div className="text-xs text-muted">{item.pack_size_quantity_ml}ml • #{item.brand_number}</div>
                    </td>
                    <td className="text-center">{item.total_bottles} Bt</td>
                    <td className="text-center highlight-cell text-primary fw-bold">{item.required_stock_bottles} Bt</td>
                    <td className="text-center text-info fw-bold">+{item.excess_bottles} Bt</td>
                    <td className={`text-center ${getCoverageColor(item.coverage_ratio)}`}>
                      {(item.coverage_ratio || 0).toFixed(1)}x
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No high stock excess detected.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. ZERO STOCK TABLE */}
        <section className="card table-card border-top-warning">
          <div className="card-header-accent flex-between">
            <div className="flex-align-center gap-2">
              <AlertCircle size={18} className="text-orange-600" />
              <h3>Out of Stock (Zero Inventory)</h3>
            </div>
            <span className="badge-status bg-orange-100 text-orange-600">{stock.zero_stock.length} Items</span>
          </div>
          <div className="table-responsive">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Pack</th>
                  <th className="text-center highlight-cell">Recent Demand</th>
                  <th className="text-center">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {stock.zero_stock.length > 0 ? stock.zero_stock.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div className="fw-bold">{item.brand_name}</div>
                      <div className="text-xs text-muted">#{item.brand_number}</div>
                    </td>
                    <td className="text-center"><span className="badge-type">{item.product_type}</span></td>
                    <td className="text-center">{item.pack_size_quantity_ml}ml</td>
                    <td className="text-center highlight-cell fw-bold text-danger">{item.latest_sold_bottles || 0} Bt</td>
                    <td className="text-center text-muted text-xs">{item.updated_at.split('T')[0]}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No items are currently out of stock.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryAnalysis;
