import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Save, AlertCircle, ShoppingCart, History, Edit, CheckCircle, X, ArrowRight, ArrowLeft, Download, ChevronsUpDown, ChevronUp, ChevronDown, Search, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import ProcessingOverlay from "../components/ProcessingOverlay";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// Date Helpers
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) return dateStr;
    const day = parts[0].padStart(2, "0");
    const month = months[parts[1]] || "01";
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const formatDateForDisplay = (dateStr) => {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return "None";
  const parts = normalized.split("-");
  if (parts.length !== 3) return normalized;
  const [year, month, day] = parts;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${monthNames[parseInt(month) - 1] || month}-${year}`;
};

// --- Sub-Components (Clean UI) ---

const ErrorModal = ({ errorData, onClose, items = [] }) => {
  if (!errorData) return null;
  
  const isDetailed = errorData.debug && errorData.error;
  const targetItem = isDetailed ? items.find(it => it.stock_id === errorData.debug.stock_id) : null;
  
  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content" 
        style={{ maxWidth: '600px' }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <div className="modal-header bg-danger text-white">
          <h3 className="text-white"><AlertCircle size={20} className="mr-2" /> Validation Error</h3>
          <button onClick={onClose} className="close-btn text-white"><X size={24}/></button>
        </div>
        <div className="modal-body">
          <div className="alert-danger p-3 rounded mb-3" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b' }}>
            <strong>Error:</strong> {errorData.error || errorData.message || "An unexpected error occurred"}
          </div>

          {targetItem && (
            <div className="brand-alert mb-3 p-3 rounded" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
               <h4 className="text-primary text-small uppercase mb-1">Affected Brand</h4>
               <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{targetItem.brand_name}</div>
               <div className="text-muted text-small">Brand Number: #{targetItem.brand_number}</div>
            </div>
          )}
          
          {isDetailed && (
            <div className="debug-info mt-3">
              <h4 className="text-small text-muted uppercase mb-2">Technical Details</h4>
              <div className="card bg-light p-3" style={{ background: '#f8fafc', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {Object.entries(errorData.debug).map(([key, value]) => (
                    <div key={key} className="debug-item border-bottom pb-1">
                      <span className="text-muted">{key.replace(/_/g, ' ')}:</span> <span className="fw-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <motion.button 
            className="btn-secondary" 
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Close and Fix Entry
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const HistoryView = ({ reportHistory, currency, onDownload, isAdmin, onDeleteReport, onDeleteFinance }) => (
  <div className="card table-card fade-in">
     <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Report Date</th>
              <th>Created By</th>
              <th>Items</th>
              <th>Surplus/Deficit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportHistory.length > 0 ? (
              reportHistory.map((report, i) => (
                <tr key={i}>
                  <td className="fw-bold">{formatDateForDisplay(report.report_date)}</td>
                  <td>
                    <div>{report.created_by}</div>
                    <div className="text-small text-muted">{report.created_at}</div>
                  </td>
                  <td>{report.total_items}</td>
                  <td className={report.finance?.total_balance < 0 ? "text-danger" : "text-success"}>
                    {report.finance ? currency.format(report.finance.total_balance) : "-"}
                  </td>
                  <td>
                    {report.edit_count > 0 ? <span className="badge warning">Edited</span> : <span className="badge success">Final</span>}
                  </td>
                  <td>
                    <div className="flex-gap">
                        <button className="btn-icon" onClick={() => onDownload(report.report_date)} title="Download PDF">
                            <Download size={16}/>
                        </button>
                        {isAdmin && (
                            <>
                                <button className="btn-icon" onClick={() => onDeleteFinance(report.report_date)} title="Reset Finance (Delete Finance Only)">
                                    <RefreshCw size={16} className="text-primary"/>
                                </button>
                                <button className="btn-icon text-danger" onClick={() => onDeleteReport(report.report_date)} title="Delete Full Report">
                                    <Trash2 size={16}/>
                                </button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-5 text-muted">No reports found in history.</td></tr>
            )}
          </tbody>
        </table>
     </div>
  </div>
);

const SettlementForm = ({ 
    settlement, 
    setSettlement, 
    totalSellAmount, 
    currency, 
    setStep, 
    handleFullSubmit, 
    submitting 
}) => {
    // Math Logic:
    // 1. Target = Sell - Last Balance (Recovering negative balance adds to target)
    const target = totalSellAmount - (Number(settlement.lastBalance) || 0);
    // 2. Collection = UPI + Cash
    const collection = (Number(settlement.upi_phonepay) || 0) + (Number(settlement.cash) || 0);
    // 3. Diff = Target - Collection (Positive = Shortage/Deficit, Negative = Surplus)
    const diff = target - collection;
    // 4. Expenses Total
    const expensesTotal = settlement.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    // 5. Final = Diff - Expenses (Expenses explain the shortage)
    const final = diff - expensesTotal;

    return (
        <div className="settlement-step fade-in">
            <div className="settlement-layout">
                <div className="settlement-main">
                    <div className="card settlement-card">
                        <div className="card-header-accent">
                            <ShoppingCart size={18} /> <h3>1. Collection vs Target</h3>
                        </div>
                        <div className="card-body">
                            <div className="settlement-row">
                                <span className="label">Stock Sell Amount:</span>
                                <span className="value fw-bold">{currency.format(totalSellAmount)}</span>
                            </div>
                            <div className="settlement-row">
                                <span className="label">Last Balance Amount:</span>
                                <span className="value">{currency.format(settlement.lastBalance || 0)}</span>
                            </div>
                            <div className="settlement-row total-row">
                                <span className="label">Net Target Value:</span>
                                <span className="value">{currency.format(target)}</span>
                            </div>
                            <hr className="my-4" />
                            <div className="settlement-row highlight-input-row">
                                <span className="label">PhonePe (UPI):</span>
                                <div className="input-with-symbol">
                                    <span className="symbol">₹</span>
                                    <input type="number" value={settlement.upi_phonepay} onChange={(e) => setSettlement(p => ({...p, upi_phonepay: e.target.value}))} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="settlement-row highlight-input-row">
                                <span className="label">Cash Collected:</span>
                                <div className="input-with-symbol">
                                    <span className="symbol">₹</span>
                                    <input type="number" value={settlement.cash} onChange={(e) => setSettlement(p => ({...p, cash: e.target.value}))} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="settlement-row total-row secondary">
                                <span className="label">After Settlement:</span>
                                <span className={`value ${diff > 0 ? 'text-danger' : 'text-success'}`}>{currency.format(diff)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settlement-side">
                    <div className="card settlement-card">
                        <div className="card-header-accent">
                            <History size={18} />
                            <div className="flex-between w-full">
                                <h3>2. Outbound Expenses</h3>
                                <button className="btn-add-small" onClick={() => setSettlement(p => ({...p, expenses: [...p.expenses, {name:"", amount:""}]}))}>+ Add</button>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="expenditure-items">
                                {settlement.expenses.map((exp, idx) => (
                                    <div key={idx} className="exp-item-row mb-2">
                                        <input type="text" className="exp-name" placeholder="Label" value={exp.name} onChange={(e) => {
                                            const news = [...settlement.expenses]; news[idx].name = e.target.value; setSettlement(p=>({...p, expenses:news}));
                                        }} />
                                        <input type="number" className="exp-amount" placeholder="0" value={exp.amount} onChange={(e) => {
                                            const news = [...settlement.expenses]; news[idx].amount = e.target.value; setSettlement(p=>({...p, expenses:news}));
                                        }} />
                                        <button className="btn-remove" onClick={() => {
                                            const news = settlement.expenses.filter((_,i)=>i!==idx); setSettlement(p=>({...p, expenses:news}));
                                        }}><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                            <div className="settlement-row total-row mt-4">
                                <span className="label">Total Expenses (+):</span>
                                <span className="value">{currency.format(expensesTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card final-summary-card">
                <div className="summary-content">
                    <div className="summary-stat">
                        <span className="label">After Settlement</span>
                        <span className={`value ${diff > 0 ? 'text-danger' : 'text-success'}`}>{currency.format(diff)}</span>
                    </div>
                    <div className="math-operator">-</div>
                    <div className="summary-stat">
                        <span className="label">Total Expenses</span>
                        <span className="value">{currency.format(expensesTotal)}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className={`final-balance-box ${final > 0 ? 'negative' : 'positive'}`}>
                        <span className="label">Final Unexplained Balance</span>
                        <span className="value">{currency.format(final)}</span>
                    </div>
                </div>
                <div className="summary-actions">
                    <button className="btn-secondary" onClick={() => setStep(1)} disabled={submitting}><ArrowLeft size={18} className="mr-2"/> Back</button>
                    <button className="btn-primary btn-submit-final" onClick={handleFullSubmit} disabled={submitting}>
                        {submitting ? "Submitting..." : <><Save size={20}/> Submit Report</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportForm = ({ 
  view, reportDate, reportExistsForDate, user, setReportDate, lastInvoiceDate, 
  loading, processedItems, handleInputChange, number, currency, 
  totalSellItems, totalSellAmount, goToStep2, handleFullSubmit,
  submitting, setView, step, setStep, settlement, setSettlement,
  sortConfig, handleSort, getSortIcon, search, setSearch
}) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (view === "create" && user?.role === "owner") {
       return (
          <div className="empty-state">
              <AlertCircle size={48} className="text-muted mb-3"/>
              <h3>Supervisor Action Required</h3>
              <p>Only supervisors can create new daily reports.</p>
              <button className="btn-secondary mt-3" onClick={() => setView("history")}>View History</button>
          </div>
       );
  }

  return (
      <div className="report-container fade-in">
          <div className="step-indicator mb-4">
              <div className={`step-pill ${step === 1 ? 'active' : 'completed'}`}>1. Stock Entry</div>
              <div className="step-line"></div>
              <div className={`step-pill ${step === 2 ? 'active' : ''}`}>2. Settlement</div>
          </div>

          {step === 1 ? (
             <>
                <div className="card form-header-card mb-4">
                    <div className="flex-between">
                        <div className="form-group mb-0">
                            <label className="d-block mb-1">Select Report Date:</label>
                            <div className="flex-gap align-center">
                                <input type="date" className="form-control" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                                <span className="text-small text-muted">Last Invoice: <strong>{formatDateForDisplay(lastInvoiceDate)}</strong></span>
                            </div>
                        </div>
                        {reportDate && lastInvoiceDate && (normalizeDate(reportDate) < normalizeDate(lastInvoiceDate) || normalizeDate(reportDate) > normalizeDate(todayStr)) && (
                            <div className="text-danger text-small"><AlertCircle size={14} /> Date must be between {formatDateForDisplay(lastInvoiceDate)} and {formatDateForDisplay(todayStr)}.</div>
                        )}
                    </div>
                </div>

                {view === "create" && reportDate && reportExistsForDate ? (
                    <div className="card empty-state p-5">
                        <CheckCircle size={48} className="text-success mb-3"/>
                        <h3>Report Already Submitted</h3>
                        <p>A sell report for {formatDateForDisplay(reportDate)} has already been created.</p>
                        <button className="btn-secondary mt-3" onClick={() => setView("history")}>View History</button>
                    </div>
                ) : (
                    <div className="card table-card">
                        <div className="table-controls p-3 pb-0">
                            <div className="search-wrap">
                                <Search size={18} className="search-icon"/>
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
                                    <div className="flex-align-center">Item {getSortIcon('brand_name')}</div>
                                </th>
                                <th onClick={() => handleSort('product_type')} className="cursor-pointer">
                                    <div className="flex-align-center">Type {getSortIcon('product_type')}</div>
                                </th>
                                <th onClick={() => handleSort('pack_size_quantity_ml')} className="cursor-pointer">
                                    <div className="flex-align-center text-center">Pack {getSortIcon('pack_size_quantity_ml')}</div>
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
                                        <div className="fw-bold">{item.brand_name}</div>
                                        <div className="text-small text-muted">{item.brand_number}</div>
                                    </td>
                                    <td><span className="badge-type">{item.product_type || "N/A"}</span></td>
                                    <td className="text-center text-muted">{item.pack_size_case}/{item.pack_size_quantity_ml} ml</td>
                                    <td className="text-center text-muted">{item.opening_cases || 0}/{item.opening_bottles || 0}</td>
                                    <td className="text-center text-muted">{item.invoice_added_cases || 0}/{item.invoice_added_bottles || 0}</td>
                                    <td className="text-center highlight-bg">{item.total_cases}/{item.total_bottles_remainder}</td>
                                    <td className="p-1"><input type="number" className={`form-control compact ${item.isError ? "border-danger" : ""}`} value={item.closing_cases} onChange={(e) => handleInputChange(item.stock_id, 'closing_cases', e.target.value)} /></td>
                                    <td className="p-1"><input type="number" className={`form-control compact ${item.isError ? "border-danger" : ""}`} value={item.closing_bottles} onChange={(e) => handleInputChange(item.stock_id, 'closing_bottles', e.target.value)} /></td>
                                    <td className="text-center fw-bold text-primary">{item.hasEntry ? number.format(item.sellBottles) : "-"}</td>
                                    <td>{number.format(item.display_rate || 0)}</td>
                                    <td className="fw-bold">{item.hasEntry ? currency.format(item.sellAmount) : "-"}</td>
                                </tr>
                                ))
                            ) : (
                                <tr><td colSpan="12" className="text-center py-5">No items found.</td></tr>
                            )}
                            </tbody>
                            <tfoot>
                            <tr className="table-footer">
                                <td colSpan="9" className="text-right fw-bold">Total Sales:</td>
                                <td className="text-center fw-bold">{number.format(totalSellItems)}</td>
                                <td></td>
                                <td className="fw-bold text-lg">{currency.format(totalSellAmount)}</td>
                            </tr>
                            </tfoot>
                        </table>
                        </div>                
                        <div className="action-bar justify-end">
                            <button className="btn-primary" onClick={goToStep2} disabled={loading || processedItems.length === 0 || (view === 'create' && (normalizeDate(reportDate) < normalizeDate(lastInvoiceDate) || normalizeDate(reportDate) > normalizeDate(todayStr)))}>
                                Next: Settlement <ArrowRight size={18} className="ml-2"/>
                            </button>
                        </div>
                    </div>
                )}
             </>
          ) : (
            <SettlementForm 
                settlement={settlement} setSettlement={setSettlement} totalSellAmount={totalSellAmount}
                currency={currency} setStep={setStep} handleFullSubmit={handleFullSubmit} submitting={submitting}
            />
          )}
      </div>
  );
};

// --- Main Page Component ---

const SellReport = () => {
  const { token, user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [view, setView] = useState("history"); 
  const [items, setItems] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [detailedError, setDetailedError] = useState(null);
  const [reportDate, setReportDate] = useState("");
  const [lastInvoiceDate, setLastInvoiceDate] = useState("");
  const [step, setStep] = useState(1);
  const [settlement, setSettlement] = useState({ lastBalance: 0, upi_phonepay: "", cash: "", expenses: [{ name: "", amount: "" }] });
  const [sortConfig, setSortConfig] = useState([]);
  const [search, setSearch] = useState("");

  const handleDeleteReport = async (date) => {
    if (!window.confirm(`Permanently delete Sell Report for ${date}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reports/sell-reports/${date}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Report deleted successfully");
      fetchHistory();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteFinance = async (date) => {
    if (!window.confirm(`Permanently reset Finance data for ${date}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/sell-finance/${date}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Reset failed");
      toast.success("Finance reset successfully");
      fetchHistory();
    } catch (err) { toast.error(err.message); }
  };

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);

  const handleSort = (key) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(s => s.key === key);
      if (existingIndex > -1) {
        const current = prev[existingIndex];
        if (current.direction === 'asc') {
          const updated = [...prev];
          updated[existingIndex] = { ...current, direction: 'desc' };
          return updated;
        } else {
          return prev.filter(s => s.key !== key);
        }
      } else {
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

  const reportExistsForDate = useMemo(() => {
    if (!Array.isArray(reportHistory) || !reportDate) return false;
    const norm = normalizeDate(reportDate);
    return reportHistory.some(r => normalizeDate(r.report_date) === norm);
  }, [reportHistory, reportDate]);

  const canEditLast = useMemo(() => {
    if (user?.role !== "owner" || reportHistory.length === 0) return false;
    const last = reportHistory[0];
    return last.edit_count === 0;
  }, [user, reportHistory]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/sell-reports`, { headers: { "Authorization": token } });
      if (res.ok) {
        const data = await res.json();
        setReportHistory(Array.isArray(data) ? data : (data.items || data.reports || []));
      }
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchPrepareData = useCallback(async (isEdit = false) => {
    setLoading(true); setError("");
    try {
      const endpoint = isEdit ? "/seller/sell-report/prepare?mode=edit" : "/seller/sell-report/prepare";
      const res = await fetch(`${API_BASE}${endpoint}`, { headers: { "Authorization": token } });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Failed to load data");
      const data = await res.json();
      if (data.latest_invoice_date) {
        setLastInvoiceDate(data.latest_invoice_date);
        if (!isEdit) setReportDate(normalizeDate(data.latest_invoice_date));
      }
      if (data.last_balance_amount !== undefined) {
        setSettlement(prev => ({ ...prev, lastBalance: data.last_balance_amount }));
      }
      setItems((data.items || []).map(item => ({ ...item, closing_cases: item.closing_cases ?? "", closing_bottles: item.closing_bottles ?? "" })));
    } catch (err) { setError("Failed to fetch sell report data"); }
    finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { if (token) { fetchHistory(); fetchPrepareData(view==="edit"); } }, [token, view, fetchHistory, fetchPrepareData]);

  const handleInputChange = (id, field, value) => {
    setItems(prev => prev.map(item => item.stock_id === id ? { ...item, [field]: value } : item));
  };

  const processedItems = useMemo(() => {
    let list = items.map(item => {
      const packSize = item.pack_size_case || 1; 
      const rate = item.mrp || item.rate_per_bottle || (item.rate_per_case ? item.rate_per_case / packSize : 0);
      const availBt = ((item.opening_cases || 0) * packSize + (item.opening_bottles || 0)) + ((item.invoice_added_cases || 0) * packSize + (item.invoice_added_bottles || 0));
      const closingBt = (Number(item.closing_cases) || 0) * packSize + (Number(item.closing_bottles) || 0);
      const hasEntry = item.closing_cases !== "" || item.closing_bottles !== "";
      let soldBt = 0, soldAmt = 0, isErr = false;
      if (hasEntry) {
        soldBt = availBt - closingBt;
        if (soldBt < 0) { soldBt = 0; isErr = true; }
        soldAmt = soldBt * rate;
      }
      return { ...item, sellBottles: soldBt, sellAmount: soldAmt, isError: isErr, hasEntry, total_cases: Math.floor(availBt / packSize), total_bottles_remainder: availBt % packSize, display_rate: rate };
    });

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(i => 
        i.brand_name?.toLowerCase().includes(s) || 
        i.brand_number?.toString().includes(s)
      );
    }

    list.sort((a, b) => {
      const compare = (v1, v2, direction = 'asc') => {
        if (v1 < v2) return direction === 'asc' ? -1 : 1;
        if (v1 > v2) return direction === 'asc' ? 1 : -1;
        return 0;
      };

      const sortKeys = [];
      sortConfig.forEach(s => sortKeys.push({ key: s.key, dir: s.direction }));
      
      const defaults = [
        { key: 'product_type', dir: 'desc' },
        { key: 'brand_name', dir: 'asc' },
        { key: 'pack_size_quantity_ml', dir: 'desc' }
      ];

      defaults.forEach(def => {
        if (!sortConfig.find(s => s.key === def.key)) sortKeys.push(def);
      });

      for (let s of sortKeys) {
        let aVal = a[s.key];
        let bVal = b[s.key];

        if (['opening_cases', 'opening_bottles', 'total_cases', 'sellBottles', 'sellAmount', 'pack_size_quantity_ml'].includes(s.key)) {
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

    return list;
  }, [items, sortConfig, search]);

  const totalSellAmount = processedItems.filter(i => i.hasEntry).reduce((sum, item) => sum + item.sellAmount, 0);
  const totalSellItems = processedItems.filter(i => i.hasEntry).reduce((sum, item) => sum + item.sellBottles, 0);

  const handleFullSubmit = async () => {
    setSubmitting(true); 
    setIsProcessing(true);
    setError("");
    setDetailedError(null);

    // Random delay between 4-10 seconds
    const processingDelay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);

    try {
      const activeItems = items.filter(item => item.closing_cases !== "" || item.closing_bottles !== "");
      
      const submitLogic = async () => {
          const reportRes = await fetch(`${API_BASE}${view === "edit" ? "/seller/sell-report/edit-last" : "/seller/sell-report"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ report_date: formatDateForDisplay(reportDate), items: activeItems.map(item => ({ stock_id: item.stock_id, closing_cases: Number(item.closing_cases) || 0, closing_bottles: Number(item.closing_bottles) || 0 })) })
          });
          
          if (!reportRes.ok) {
            const data = await reportRes.json();
            throw data; // Throw the whole JSON object for better error handling
          }

          const financeRes = await fetch(`${API_BASE}/seller/sell-finance`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ report_date: formatDateForDisplay(reportDate), upi_phonepay: Number(settlement.upi_phonepay) || 0, cash: Number(settlement.cash) || 0, expenses: settlement.expenses.map(e => ({ name: e.name, amount: Number(e.amount) || 0 })) })
          });
          
          if (!financeRes.ok) {
            const data = await financeRes.json();
            throw data;
          }
          
          return true;
      };

      await Promise.all([
        submitLogic(),
        new Promise(resolve => setTimeout(resolve, processingDelay))
      ]);

      toast.success("Sell Report submitted successfully!"); 
      setView("history"); setStep(1); fetchHistory();
    } catch (err) { 
        console.error("Submission Error:", err);
        const msg = err.error || err.message || "An unknown error occurred during submission";
        setError(msg);
        setDetailedError(err);
        toast.error(msg); 
    }
    finally { 
        setSubmitting(false); 
        setIsProcessing(false);
    }
  };

  const handleDownload = async (reportDate) => {
    try {
      const res = await fetch(`${API_BASE}/reports/sell-reports/${reportDate}/pdf`, {
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sell_report_${reportDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      toast.error("Failed to download PDF: " + err.message);
    }
  };

  return (
    <div className="sell-report-page">
      {isProcessing && <ProcessingOverlay message="Submitting Daily Report..." />}
      {detailedError && <ErrorModal errorData={detailedError} items={items} onClose={() => setDetailedError(null)} />}
      <header className="page-header">
        <div className="header-content">
          <div><h1>Daily Sell Report</h1><p className="text-muted">{new Date().toDateString()}</p></div>
          <div className="flex-gap">
             {view === "history" ? (
                <>
                    {user?.role === "supervisor" && (
                      <motion.button 
                        className="btn-primary" 
                        onClick={() => setView("create")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingCart size={16}/> Create Report
                      </motion.button>
                    )}
                    {canEditLast && (
                      <motion.button 
                        className="btn-secondary" 
                        onClick={() => setView("edit")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit size={16}/> Edit Last Report
                      </motion.button>
                    )}
                </>
             ) : (
               <motion.button 
                className="btn-secondary" 
                onClick={() => setView("history")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
               >
                <History size={16}/> View History
               </motion.button>
             )}
          </div>
        </div>
      </header>
      {error && <div className="error-banner"><AlertCircle size={16}/> {error}</div>}
      {view === "history" ? <HistoryView reportHistory={reportHistory} currency={currency} onDownload={handleDownload} isAdmin={isAdmin} onDeleteReport={handleDeleteReport} onDeleteFinance={handleDeleteFinance} /> : 
        <ReportForm  
          view={view} reportDate={reportDate} reportExistsForDate={reportExistsForDate} user={user} setReportDate={setReportDate} 
          lastInvoiceDate={lastInvoiceDate} loading={loading} processedItems={processedItems} handleInputChange={handleInputChange} 
          number={number} currency={currency} totalSellItems={totalSellItems} totalSellAmount={totalSellAmount} 
          goToStep2={() => setStep(2)} handleFullSubmit={handleFullSubmit} submitting={submitting} 
          setView={setView} step={step} setStep={setStep} settlement={settlement} setSettlement={setSettlement} 
          sortConfig={sortConfig} handleSort={handleSort} getSortIcon={getSortIcon}
          search={search} setSearch={setSearch}
        />}
    </div>
  );
};

export default SellReport;