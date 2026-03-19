import React from "react";
import { ShoppingCart } from "lucide-react";
import { getStockLevelColor } from "./AnalysisUtils";

const RequiredStockTable = ({ requiredStock }) => (
  <section className="card table-card mb-4 border-top-danger smooth-table-card">
    <div className="card-header-accent flex-between pro-header">
      <div className="flex-align-center gap-2">
        <ShoppingCart size={18} className="text-danger" />
        <h3>Required Stock Audit (Everything Needed)</h3>
      </div>
      <span className="badge-pro">SYSTEM PREDICTION</span>
    </div>
    <div className="table-responsive">
      <table className="analysis-table smooth-table">
        <thead>
          <tr>
            <th>Brand Name</th>
            <th className="text-center">Current</th>
            <th className="text-center highlight-pro">Required (Bt)</th>
            <th className="text-center highlight-pro">Required (Cs)</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {requiredStock && requiredStock.length > 0 ? requiredStock.map((item, i) => (
            <tr key={item.id || i}>
              <td>
                <div className="fw-bold text-main">{item.brand_name}</div>
                <div className="text-xs text-muted font-mono">#{item.brand_number} • {item.pack_size_quantity_ml}ml</div>
              </td>
              <td className="text-center text-muted">{item.total_bottles} Bt</td>
              <td className="text-center highlight-pro text-danger" style={{ fontWeight: '900', fontSize: '1rem' }}>
                {item.required_stock_bottles} Bt
              </td>
              <td className="text-center highlight-pro text-danger" style={{ fontWeight: '900', fontSize: '1rem' }}>
                {item.required_stock_cases} Cs
              </td>
              <td className="text-center">
                <span className={`badge-status ${getStockLevelColor(item.stock_level)}`}>
                    {item.stock_level.toUpperCase()}
                </span>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="5" className="text-center py-5 text-muted">No items currently require stock updates.</td></tr>
          )}
        </tbody>
      </table>
    </div>
    <style>{`
        .smooth-table-card { border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .pro-header { background: linear-gradient(to right, #ffffff, #f8fafc); padding: 1rem 1.5rem; }
        .badge-pro { font-size: 0.6rem; font-weight: 900; background: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em; }
        .smooth-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
        .smooth-table tr:hover td { background: #fcfdfe; }
        .highlight-pro { background: #fff1f2 !important; border-left: 1px solid #fee2e2; border-right: 1px solid #fee2e2; }
        .text-main { color: #1e293b; }
    `}</style>
  </section>
);

export default RequiredStockTable;
