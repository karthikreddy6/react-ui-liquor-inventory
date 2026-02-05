import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, RefreshCw, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown, Edit3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";

const Stock = () => {
  const { token, logout, user } = useAuth();
  const [stock, setStock] = useState([]); 
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isShortView, setIsShortView] = useState(() => {
    return localStorage.getItem("stock_isShortView") === "true";
  });
  
  const isAdmin = user?.role === "admin";
  const [sortConfig, setSortConfig] = useState([]);

  const handleQuickEdit = async (item) => {
    const cases = window.prompt(`Edit ${item.brand_name}\nNew Total Cases:`, item.total_cases);
    if (cases === null) return;
    const bottles = window.prompt("New Total Bottles:", item.total_bottles);
    if (bottles === null) return;
    const rate = window.prompt("New Rate per Case:", item.rate_per_case);
    if (rate === null) return;

    try {
      const res = await fetch(`${API_BASE}/admin/stock/${item.id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          total_cases: Number(cases),
          total_bottles: Number(bottles),
          rate_per_case: Number(rate)
        })
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Updated successfully!");
      fetchStock(); // Refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);

  // Save only view preference
  useEffect(() => {
    localStorage.setItem("stock_isShortView", isShortView);
  }, [isShortView]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(s => s.key === key);
      
      if (existingIndex > -1) {
        const current = prev[existingIndex];
        if (current.direction === 'asc') {
          // Toggle to desc
          const updated = [...prev];
          updated[existingIndex] = { ...current, direction: 'desc' };
          return updated;
        } else {
          // Remove this sort key
          return prev.filter(s => s.key !== key);
        }
      } else {
        // Add as primary sort (to the front of the stack)
        return [{ key, direction: 'asc' }, ...prev];
      }
    });
  };

  const getSortIcon = (key) => {
    const sort = sortConfig.find(s => s.key === key);
    const priority = sortConfig.findIndex(s => s.key === key);
    
    if (!sort) return <ChevronsUpDown size={14} className="ml-1 opacity-50" />;
    
    return (
      <div className="flex-align-center ml-1">
        {sort.direction === 'asc' ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />}
        {sortConfig.length > 1 && <span className="sort-priority-badge">{priority + 1}</span>}
      </div>
    );
  };

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/stock`, {
        headers: {
          "Authorization": token
        }
      });
      
      if (res.status === 401) {
        logout();
        return;
      }
      
      if (!res.ok) throw new Error("Stock fetch failed");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setStock(data);
        
        const totalCases = data.reduce((sum, item) => sum + (Number(item.total_cases) || 0), 0);
        const totalValuation = data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
        
        setSummary({
          total_cases_all_items: totalCases,
          total_price_all_items: totalValuation,
          last_updated_item_name: "Calculated from list" 
        });
      } else {
         setStock(data.stock || []);
         setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch present stock");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchStock();
    }
  }, [token, fetchStock]);

  const sortedStock = useMemo(() => {
    if (!Array.isArray(stock)) return [];
    
    let filtered = stock.filter((item) => 
      item.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand_number?.toString().includes(search)
    );

    filtered.sort((a, b) => {
      // Helper function to compare two values
      const compare = (v1, v2, direction = 'asc') => {
        if (v1 < v2) return direction === 'asc' ? -1 : 1;
        if (v1 > v2) return direction === 'asc' ? 1 : -1;
        return 0;
      };

      // Hierarchical sort logic
      const sortKeys = [];
      
      // 1. User selected multi-sort stack
      sortConfig.forEach(s => sortKeys.push({ key: s.key, dir: s.direction }));
      
      // 2. Default fallbacks (Type > Brand > Pack)
      const defaults = [
        { key: 'product_type', dir: 'desc' },
        { key: 'brand_name', dir: 'asc' },
        { key: 'pack_size_quantity_ml', dir: 'desc' }
      ];

      // Add defaults if they aren't already in the user's sort stack
      defaults.forEach(def => {
        if (!sortConfig.find(s => s.key === def.key)) {
          sortKeys.push(def);
        }
      });

      // Execute comparison
      for (let s of sortKeys) {
        let aVal = a[s.key];
        let bVal = b[s.key];

        // Numeric handling
        if (['total_cases', 'total_bottles', 'rate_per_case', 'total_amount', 'pack_size_quantity_ml'].includes(s.key)) {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = aVal?.toString().toLowerCase() || "";
          bVal = bVal?.toString().toLowerCase() || "";
        }

        const result = compare(aVal, bVal, s.dir);
        if (result !== 0) return result;
      }
      
      return 0;
    });
    
    return filtered;
  }, [stock, search, sortConfig]);

  return (
    <div className="stock-page">
      <header className="page-header">
        <div className="header-content">
            <div>
                <h1>Present Stock</h1>
                <p className="text-muted">Real-time view of your warehouse stock.</p>
            </div>
            <button className="btn-secondary" onClick={fetchStock} disabled={loading}>
                <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh Stock
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
          {/* <div className="card summary-item">
            <span className="label">Data Source</span>
            <span className="value text-small"></span>
          </div> */}
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
          <button 
            className={`btn-toggle-view ${isShortView ? 'active' : ''}`}
            onClick={() => setIsShortView(!isShortView)}
          >
            {isShortView ? "Show Full View" : "Show Short View"}
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th onClick={() => handleSort('brand_name')} className="cursor-pointer">
                  <div className="flex-align-center">Brand {getSortIcon('brand_name')}</div>
                </th>
                <th onClick={() => handleSort('product_type')} className="cursor-pointer">
                  <div className="flex-align-center">Type {getSortIcon('product_type')}</div>
                </th>
                {!isShortView && <th onClick={() => handleSort('pack_size_quantity_ml')} className="cursor-pointer">
                  <div className="flex-align-center">Pack {getSortIcon('pack_size_quantity_ml')}</div>
                </th>}
                <th onClick={() => handleSort('total_cases')} className="cursor-pointer">
                  <div className="flex-align-center text-center">Total Cases {getSortIcon('total_cases')}</div>
                </th>
                <th onClick={() => handleSort('total_bottles')} className="cursor-pointer">
                  <div className="flex-align-center text-center">Total Bottles {getSortIcon('total_bottles')}</div>
                </th>
                {!isShortView && (
                  <>
                    <th onClick={() => handleSort('rate_per_case')} className="cursor-pointer">
                      <div className="flex-align-center">Rate/Case {getSortIcon('rate_per_case')}</div>
                    </th>
                    <th onClick={() => handleSort('total_amount')} className="cursor-pointer">
                      <div className="flex-align-center">Total Value {getSortIcon('total_amount')}</div>
                    </th>
                    <th onClick={() => handleSort('last_invoice_date')} className="cursor-pointer">
                      <div className="flex-align-center">Last Update {getSortIcon('last_invoice_date')}</div>
                    </th>
                  </>
                )}
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedStock.length > 0 ? (
                sortedStock.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="fw-bold">{item.brand_name}</div>
                      <div className="text-small text-muted">{item.brand_number}</div>
                    </td>
                    <td><span className="badge-type">{item.product_type || "N/A"}</span></td>
                    {!isShortView && <td>{item.pack_type || "Case"} ({item.pack_size_quantity_ml}ml)</td>}
                    <td className="text-center">{number.format(item.total_cases || 0)}</td>
                    <td className="text-center">{number.format(item.total_bottles || 0)}</td>
                    {!isShortView && (
                      <>
                        <td>{currency.format(item.rate_per_case || 0)}</td>
                        <td className="fw-bold">{currency.format(item.total_amount || 0)}</td>
                        <td className="text-small text-muted">{item.last_invoice_date || "-"}</td>
                      </>
                    )}
                    {isAdmin && (
                      <td>
                        <button className="btn-icon" onClick={() => handleQuickEdit(item)} title="Quick Edit">
                          <Edit3 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? (isShortView ? 6 : 10) : (isShortView ? 5 : 9)} className="text-center">
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
