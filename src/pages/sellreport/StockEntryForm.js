import React from "react";
import { Search, Printer, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { formatDateForDisplay, getSortIcon, preventWheelNumberChange, normalizeDate } from "./SellReportUtils";

const StockEntryForm = ({
  view, reportDate, reportExistsForDate, user, setView, loading, processedItems, 
  handleInputChange, number, currency, totalSellItems, totalSellAmount, goToStep2,
  sortConfig, handleSort, search, setSearch, nextStepError, disableNextStep,
  sortMode, setSortMode, baseReportDate, handleDateChange
}) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (view === "create" && user?.role === "owner") {
    return (
      <div className="empty-state">
        <AlertCircle size={48} className="text-muted mb-3" />
        <h3>Supervisor Action Required</h3>
        <p>Only supervisors can create new daily reports.</p>
        <button className="btn-secondary mt-3" onClick={() => setView("history")}>View History</button>
      </div>
    );
  }

  return (
    <div className="stock-entry-step fade-in">
      <div className="card form-header-card mb-4">
        <div className="flex-between">
          <div className="form-group mb-0">
            <label className="d-block mb-1">Select Report Date:</label>
            <div className="flex-gap align-center">
              <input
                type="date"
                className="form-control"
                value={reportDate}
                min={baseReportDate}
                max={todayStr}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <span className="text-small text-muted">Min Allowed: <strong>{formatDateForDisplay(baseReportDate)}</strong></span>
            </div>
          </div>
          <div className="flex-gap align-center" style={{ marginLeft: '1rem' }}>
            <label className="text-small fw-bold mr-2">Sort Order:</label>
            <div className="btn-group" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                className={`btn-toggle-small ${sortMode === 'default' ? 'active' : ''}`}
                onClick={() => setSortMode('default')}
                style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: sortMode === 'default' ? 'white' : 'transparent', boxShadow: sortMode === 'default' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: sortMode === 'default' ? '700' : '500' }}
              >
                Default
              </button>
              <button
                className={`btn-toggle-small ${sortMode === 'custom' ? 'active' : ''}`}
                onClick={() => setSortMode('custom')}
                style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: sortMode === 'custom' ? 'white' : 'transparent', boxShadow: sortMode === 'custom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontWeight: sortMode === 'custom' ? '700' : '500' }}
              >
                Custom
              </button>
            </div>
          </div>
          {reportDate && baseReportDate && (normalizeDate(reportDate) < normalizeDate(baseReportDate) || normalizeDate(reportDate) > normalizeDate(todayStr)) && (
            <div className="text-danger text-small"><AlertCircle size={14} /> Date must be between {formatDateForDisplay(baseReportDate)} and {formatDateForDisplay(todayStr)}.</div>
          )}
        </div>
      </div>

      {view === "create" && reportDate && reportExistsForDate ? (
        <div className="card empty-state p-5">
          <CheckCircle size={48} className="text-success mb-3" />
          <h3>Report Already Submitted</h3>
          <p>A sell report for {formatDateForDisplay(reportDate)} has already been created.</p>
          <button className="btn-secondary mt-3" onClick={() => setView("history")}>View History</button>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-controls p-3 pb-0">
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by brand name or number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="sell-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th onClick={() => handleSort('brand_name')} className="cursor-pointer">
                    <div className="flex-align-center">Item {getSortIcon('brand_name', sortConfig)}</div>
                  </th>
                  <th onClick={() => handleSort('product_type')} className="cursor-pointer">
                    <div className="flex-align-center">Type {getSortIcon('product_type', sortConfig)}</div>
                  </th>
                  <th onClick={() => handleSort('pack_size_quantity_ml')} className="cursor-pointer">
                    <div className="flex-align-center text-center">Pack {getSortIcon('pack_size_quantity_ml', sortConfig)}</div>
                  </th>
                  <th className="text-center">Opening</th>
                  <th className="text-center">Added</th>
                  <th className="text-center">Total Avail</th>
                  <th className="text-center">Closing (Cs)</th>
                  <th className="text-center">Closing (Bt)</th>
                  <th className="text-center">Sold (Bt)</th>
                  <th>MRP</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="12" className="text-center py-5 text-muted">Loading inventory data...</td></tr>
                ) : processedItems.length > 0 ? (
                  processedItems.map((item, i) => (
                    <tr key={item.stock_id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="fw-bold">{item.display_brand_name || item.brand_name}</div>
                        <div className="text-small text-muted">{item.brand_number}</div>
                      </td>
                      <td><span className="badge-type">{item.product_type || "N/A"}</span></td>
                      <td className="text-center text-muted">{item.pack_size_case}/{item.pack_size_quantity_ml} ml</td>
                      <td className="text-center text-muted">{item.opening_cases || 0}/{item.opening_bottles || 0}</td>
                      <td className="text-center text-muted">{item.invoice_added_cases || 0}/{item.invoice_added_bottles || 0}</td>
                      <td className="text-center highlight-bg">{item.total_cases}/{item.total_bottles_remainder}</td>
                      <td className="p-1"><input type="number" className={`form-control compact ${item.isError ? "border-danger" : ""}`} value={item.closing_cases} onWheel={preventWheelNumberChange} onChange={(e) => handleInputChange(item.stock_id, 'closing_cases', e.target.value)} /></td>
                      <td className="p-1"><input type="number" className={`form-control compact ${item.isError ? "border-danger" : ""}`} value={item.closing_bottles} onWheel={preventWheelNumberChange} onChange={(e) => handleInputChange(item.stock_id, 'closing_bottles', e.target.value)} /></td>
                      <td className="text-center fw-bold text-primary">
                        <span className="no-print">{item.hasEntry ? number.format(item.sellBottles) : "-"}</span>
                        <span className="print-only" style={{ display: 'none' }}>
                          {item.hasEntry && item.sellBottles !== 0 ? number.format(Math.abs(item.sellBottles)) : ""}
                        </span>
                      </td>
                      <td>{number.format(item.display_rate || 0)}</td>
                      <td className="fw-bold">
                        <span className="no-print">{item.hasEntry ? currency.format(item.sellAmount) : "-"}</span>
                        <span className="print-only" style={{ display: 'none' }}>
                          {item.hasEntry && item.sellAmount !== 0 ? currency.format(Math.abs(item.sellAmount)) : ""}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="12" className="text-center py-5">No items found.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="table-footer">
                  <td colSpan="9" className="text-right fw-bold">Total Sales:</td>
                  <td className="text-center fw-bold">
                    <span className="no-print">{number.format(totalSellItems)}</span>
                    <span className="print-only" style={{ display: 'none' }}>
                      {totalSellItems !== 0 ? number.format(Math.abs(totalSellItems)) : ""}
                    </span>
                  </td>
                  <td></td>
                  <td className="fw-bold text-lg">
                    <span className="no-print">{currency.format(totalSellAmount)}</span>
                    <span className="print-only" style={{ display: 'none' }}>
                      {totalSellAmount !== 0 ? currency.format(Math.abs(totalSellAmount)) : ""}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="action-bar justify-end">
            <button className="btn-secondary mr-2" onClick={() => window.print()}>
              <Printer size={18} className="mr-2" /> Print Table
            </button>
            {nextStepError && (
              <div className="text-danger text-small">{nextStepError}</div>
            )}
            <button className="btn-primary" onClick={goToStep2} disabled={disableNextStep || (view === 'create' && (normalizeDate(reportDate) < normalizeDate(baseReportDate) || normalizeDate(reportDate) > normalizeDate(todayStr)))}>
              Next: Settlement <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockEntryForm;
