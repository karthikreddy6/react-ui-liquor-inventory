import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Award } from "lucide-react";
import { currencyFormatter } from "./AnalysisUtils";

const SalesAnalysis = ({ stock }) => {
  return (
    <div className="sales-analysis-view fade-in">
      <div className="analysis-grid">
        {/* 1. TOP SELLING STOCK */}
        <section className="card table-card mb-4 border-top-success">
          <div className="card-header-accent flex-between">
            <div className="flex-align-center gap-2">
              <Award size={18} className="text-success" />
              <h3>Fast Moving Items (Top Selling)</h3>
            </div>
            <span className="text-small text-muted italic">Highest volume in recent reports</span>
          </div>
          <div className="table-responsive">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th className="text-center">Avg Sold</th>
                  <th className="text-center">Latest Sold</th>
                  <th className="text-center highlight-cell">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {stock.top_selling_stock.length > 0 ? stock.top_selling_stock.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div className="fw-bold">{item.brand_name}</div>
                      <div className="text-xs text-muted">{item.pack_size_quantity_ml}ml • #{item.brand_number}</div>
                    </td>
                    <td className="text-center fw-bold">{item.average_recent_sold_bottles.toFixed(1)}</td>
                    <td className="text-center text-success fw-bold">{item.latest_sold_bottles} Bt</td>
                    <td className="text-center highlight-cell fw-bold">{currencyFormatter.format(item.total_amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">Insufficient sales data for ranking.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. TOP VALUE STOCK */}
        <section className="card table-card mb-4 border-top-primary">
          <div className="card-header-accent flex-between">
            <div className="flex-align-center gap-2">
              <DollarSign size={18} className="text-primary" />
              <h3>High Capital Concentration (Top Value)</h3>
            </div>
            <span className="text-small text-muted italic">Items representing most stock value</span>
          </div>
          <div className="table-responsive">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th className="text-center">Current Stock</th>
                  <th className="text-center">Unit Type</th>
                  <th className="text-center highlight-cell">Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {stock.top_value_stock.length > 0 ? stock.top_value_stock.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div className="fw-bold">{item.brand_name}</div>
                      <div className="text-xs text-muted">#{item.brand_number}</div>
                    </td>
                    <td className="text-center fw-bold">{item.total_bottles} Bt</td>
                    <td className="text-center"><span className="badge-type">{item.product_type}</span></td>
                    <td className="text-center highlight-cell fw-bold text-primary">{currencyFormatter.format(item.total_amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">No high value stock data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. LOW SELLING STOCK */}
        <section className="card table-card border-top-warning">
          <div className="card-header-accent flex-between">
            <div className="flex-align-center gap-2">
              <TrendingDown size={18} className="text-orange-600" />
              <h3>Dead Stock Warning (Low Selling)</h3>
            </div>
            <span className="text-small text-muted italic">Low movement items</span>
          </div>
          <div className="table-responsive">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th className="text-center">Current Stock</th>
                  <th className="text-center">Avg Sold</th>
                  <th className="text-center highlight-cell">Last Invoice</th>
                </tr>
              </thead>
              <tbody>
                {stock.low_selling_stock.length > 0 ? stock.low_selling_stock.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>
                      <div className="fw-bold">{item.brand_name}</div>
                      <div className="text-xs text-muted">{item.pack_size_quantity_ml}ml</div>
                    </td>
                    <td className="text-center">{item.total_bottles} Bt</td>
                    <td className="text-center fw-bold text-danger">{item.average_recent_sold_bottles.toFixed(2)}</td>
                    <td className="text-center highlight-cell text-muted text-xs">{item.last_invoice_date || "N/A"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">No slow moving items detected.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesAnalysis;
