import React, { useState, useMemo, useEffect } from "react";
import { Search, RefreshCw, AlertCircle } from "lucide-react";

const API_BASE = "http://127.0.0.1:5000";

const Stock = () => {
  const [stock, setStock] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);

  const fetchStock = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/stock`);
      if (!res.ok) throw new Error("Stock fetch failed");
      const data = await res.json();
      setStock(data.stock);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch present stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredStock = useMemo(() => {
    if (!stock) return [];
    return stock.filter((item) => item.brand_name.toLowerCase().includes(search.toLowerCase()));
  }, [stock, search]);

  return (
    <div className="stock-page">
      <header className="page-header">
        <div className="header-content">
            <div>
                <h1>Current Inventory</h1>
                <p className="text-muted">Real-time view of your warehouse stock.</p>
            </div>
            <button className="btn-secondary" onClick={fetchStock} disabled={loading}>
                <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
            </button>
        </div>
      </header>

      {error && <div className="error-banner"><AlertCircle size={16}/> {error}</div>}

      {summary && (
        <div className="summary-cards">
          <div className="card summary-item">
            <span className="label">Total Cases</span>
            <span className="value">{number.format(summary.total_cases_all_items || 0)}</span>
          </div>
          <div className="card summary-item">
            <span className="label">Total Valuation</span>
            <span className="value highlight">{currency.format(summary.total_price_all_items || 0)}</span>
          </div>
          <div className="card summary-item">
            <span className="label">Last Updated</span>
            <span className="value text-small">{summary.last_updated_item_name || "-"}</span>
          </div>
        </div>
      )}

      <div className="card table-card">
        <div className="table-controls">
          <div className="search-wrap">
            <Search size={18} className="search-icon"/>
            <input 
              type="text" 
              placeholder="Search by brand name..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Brand</th>
                <th>Pack</th>
                <th>Total Cases</th>
                <th>Total Bottles</th>
                <th>Rate/Case</th>
                <th>Total Value</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length > 0 ? (
                filteredStock.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="fw-bold">{item.brand_name}</div>
                      <div className="text-small text-muted">{item.brand_number} • {item.product_type}</div>
                    </td>
                    <td>{item.pack_type} ({item.pack_size_quantity_ml}ml)</td>
                    <td>{number.format(item.total_cases || 0)}</td>
                    <td>{number.format(item.total_bottles || 0)}</td>
                    <td>{currency.format(item.rate_per_case || 0)}</td>
                    <td className="fw-bold">{currency.format(item.total_amount || 0)}</td>
                    <td className="text-small text-muted">{item.last_invoice_date || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    {loading ? "Loading inventory data..." : "No items found matching your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;
