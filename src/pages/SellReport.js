import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingCart, History, Edit, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import ProcessingOverlay from "../components/ProcessingOverlay";
import StatementModal from "../components/StatementModal";
import { toast } from "react-hot-toast";

// Modular Components
import { normalizeDate, isISODate } from "./sellreport/SellReportUtils";
import HistoryView from "./sellreport/HistoryView";
import StockEntryForm from "./sellreport/StockEntryForm";
import SettlementForm from "./sellreport/SettlementForm";
import ErrorModal from "./sellreport/ErrorModal";

const SellReport = () => {
  const { token, user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  
  // View & Step State
  const [view, setView] = useState("history"); // history, create, edit
  const [step, setStep] = useState(1); // 1: Stock Entry, 2: Settlement
  
  // Data State
  const [items, setItems] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [reportDate, setReportDate] = useState("");
  const [lastInvoiceDate, setLastInvoiceDate] = useState("");
  const [baseReportDate, setBaseReportDate] = useState("");
  const [customBrandOrder, setCustomBrandOrder] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [detailedError, setDetailedError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("default");
  const [sortConfig, setSortConfig] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatementAction = async (from, to, type) => {
    const url = `${API_BASE}/reports/sell-reports/pdf?date_from=${from}&date_to=${to}`;
    try {
      const res = await fetch(url, { headers: { "Authorization": token } });
      if (!res.ok) throw new Error("Failed to generate statement");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      if (type === 'view') {
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `sell_reports_${from}_to_${to}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  // Settlement State
  const [settlement, setSettlement] = useState({
    lastBalance: 0,
    upi_phonepay: "",
    phonepay_entries: [{ date: "", amount: "" }],
    cash: "",
    cash_entries: [{ date: "", amount: "" }],
    expenses: [{ name: "", amount: "" }],
    outside_income: [{ name: "", amount: "" }]
  });

  // --- Derived Data ---

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);

  const latestReportDate = useMemo(() => {
    if (!Array.isArray(reportHistory) || reportHistory.length === 0) return "";
    return reportHistory
      .map(r => normalizeDate(r.report_date))
      .filter(isISODate)
      .sort()
      .pop() || "";
  }, [reportHistory]);

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

  const previousReportDate = useMemo(() => {
    const current = normalizeDate(reportDate);
    if (!isISODate(current) || !Array.isArray(reportHistory) || reportHistory.length === 0) return "";
    return reportHistory
      .map((r) => normalizeDate(r?.report_date))
      .filter((d) => isISODate(d) && d < current)
      .sort()
      .pop() || "";
  }, [reportHistory, reportDate]);

  // --- Data Fetching ---

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/sell-reports`, { headers: { "Authorization": token } });
      if (res.ok) {
        const data = await res.json();
        setReportHistory(Array.isArray(data) ? data : (data.items || data.reports || []));
      }
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchPrepareData = useCallback(async (targetDate = null) => {
    setLoading(true); setError("");
    try {
      let url = `${API_BASE}/seller/sell-report/prepare`;
      if (view === "edit") {
        url += "?mode=edit";
      } else if (targetDate) {
        url += `?report_date=${targetDate}`;
      }

      const res = await fetch(url, { headers: { "Authorization": token } });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to load data");
      }
      
      const data = await res.json();
      if (data.latest_invoice_date_iso) setLastInvoiceDate(data.latest_invoice_date_iso);
      if (data.base_report_date) setBaseReportDate(data.base_report_date);
      if (data.selected_report_date && (!targetDate || view === "edit")) setReportDate(data.selected_report_date);
      if (data.last_balance_amount !== undefined) setSettlement(prev => ({ ...prev, lastBalance: data.last_balance_amount }));
      if (data.custom_brand_order) setCustomBrandOrder(data.custom_brand_order);

      setItems((data.items || []).map(item => ({ 
        ...item, 
        closing_cases: item.closing_cases ?? "", 
        closing_bottles: item.closing_bottles ?? "" 
      })));
    } catch (err) { 
      setError(err.message || "Failed to fetch sell report data"); 
    } finally { 
      setLoading(false); 
    }
  }, [token, logout, view]);

  useEffect(() => { 
    if (token) { 
        fetchHistory(); 
        fetchPrepareData(); 
    } 
  }, [token, view, fetchHistory, fetchPrepareData]);

  // --- Logic Handlers ---

  const handleDateChange = (newDate) => {
    setReportDate(newDate);
    fetchPrepareData(newDate);
  };

  const handleInputChange = (id, field, value) => {
    setItems(prev => prev.map(item => item.stock_id === id ? { ...item, [field]: value } : item));
  };

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

  const validateStockEntry = useCallback((item) => {
    const packSize = Math.max(1, Number(item.pack_size_case) || 1);
    const hasEntry = item.closing_cases !== "" || item.closing_bottles !== "";
    if (!hasEntry) return { hasEntry: false, isInvalid: false, message: "" };

    const closingCases = Number(item.closing_cases);
    const closingBottles = Number(item.closing_bottles);

    if (!Number.isFinite(closingCases) || !Number.isFinite(closingBottles)) return { hasEntry: true, isInvalid: true, message: "Numeric values required." };
    if (!Number.isInteger(closingCases) || !Number.isInteger(closingBottles)) return { hasEntry: true, isInvalid: true, message: "Whole numbers required." };
    if (closingCases < 0 || closingBottles < 0) return { hasEntry: true, isInvalid: true, message: "Cannot be negative." };
    if (closingBottles >= packSize) return { hasEntry: true, isInvalid: true, message: `Bottles must be < ${packSize}.` };

    const availBt = ((item.opening_cases || 0) * packSize + (item.opening_bottles || 0)) +
      ((item.invoice_added_cases || 0) * packSize + (item.invoice_added_bottles || 0));
    const closingBt = (closingCases * packSize) + closingBottles;

    if (closingBt > availBt) return { hasEntry: true, isInvalid: true, message: "Exceeds available stock." };
    return { hasEntry: true, isInvalid: false, message: "" };
  }, []);

  const processedItems = useMemo(() => {
    let list = items.map(item => {
      const packSize = item.pack_size_case || 1; 
      const rate = item.mrp || item.rate_per_bottle || (item.rate_per_case ? item.rate_per_case / packSize : 0);
      const availBt = ((item.opening_cases || 0) * packSize + (item.opening_bottles || 0)) + ((item.invoice_added_cases || 0) * packSize + (item.invoice_added_bottles || 0));
      const closingBt = (Number(item.closing_cases) || 0) * packSize + (Number(item.closing_bottles) || 0);
      const { hasEntry, isInvalid } = validateStockEntry(item);
      const soldBt = hasEntry ? Math.max(0, availBt - closingBt) : 0;
      return { 
        ...item, 
        sellBottles: soldBt, 
        sellAmount: soldBt * rate, 
        isError: isInvalid, 
        hasEntry, 
        total_cases: Math.floor(availBt / packSize), 
        total_bottles_remainder: availBt % packSize, 
        display_rate: rate 
      };
    }).filter(i => (view === "edit" && i.hasEntry) || i.total_cases > 0 || i.total_bottles_remainder > 0);

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(i => i.brand_name?.toLowerCase().includes(s) || i.brand_number?.toString().includes(s));
    }

    list.sort((a, b) => {
      if (sortMode === "custom" && customBrandOrder.length > 0) {
        const indexA = customBrandOrder.indexOf(a.brand_number);
        const indexB = customBrandOrder.indexOf(b.brand_number);
        if (indexA !== -1 && indexB !== -1) {
            if (indexA !== indexB) return indexA - indexB;
            return (Number(a.pack_size_quantity_ml) || 0) - (Number(b.pack_size_quantity_ml) || 0);
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
      }

      const sortKeys = [...sortConfig];
      const defaults = [{ key: 'product_type', dir: 'desc' }, { key: 'brand_name', dir: 'asc' }, { key: 'pack_size_quantity_ml', dir: 'asc' }];
      defaults.forEach(def => { if (!sortConfig.find(s => s.key === def.key)) sortKeys.push(def); });

      for (let s of sortKeys) {
        let aVal = a[s.key], bVal = b[s.key];
        if (['opening_cases', 'opening_bottles', 'total_cases', 'sellBottles', 'sellAmount', 'pack_size_quantity_ml'].includes(s.key)) {
          aVal = Number(aVal) || 0; bVal = Number(bVal) || 0;
        } else {
          aVal = aVal?.toString().toLowerCase() || ""; bVal = bVal?.toString().toLowerCase() || "";
        }
        if (aVal < bVal) return s.direction === 'asc' || s.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return s.direction === 'asc' || s.dir === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return list;
  }, [items, sortConfig, search, validateStockEntry, sortMode, customBrandOrder, view]);

  const goToStep2 = useCallback(() => {
    const activeItems = items.filter(item => item.closing_cases !== "" || item.closing_bottles !== "");
    if (activeItems.length === 0) { toast.error("Enter at least one stock entry."); return; }
    for (const item of activeItems) {
      const val = validateStockEntry(item);
      if (val.isInvalid) { toast.error(`${item.brand_name}: ${val.message}`); return; }
    }
    setError(""); setStep(2);
  }, [items, validateStockEntry]);

  const nextStepError = useMemo(() => {
    const activeItems = items.filter(item => item.closing_cases !== "" || item.closing_bottles !== "");
    if (activeItems.length === 0) return "Enter at least one stock entry.";
    for (const item of activeItems) {
      const val = validateStockEntry(item);
      if (val.isInvalid) return `${item.brand_name}: ${val.message}`;
    }
    return "";
  }, [items, validateStockEntry]);

  const totalSellAmount = processedItems.filter(i => i.hasEntry).reduce((sum, item) => sum + item.sellAmount, 0);
  const totalSellItems = processedItems.filter(i => i.hasEntry).reduce((sum, item) => sum + item.sellBottles, 0);

  // --- Submissions & Actions ---

  const handleFullSubmit = async () => {
    setSubmitting(true); setIsProcessing(true); setError(""); setDetailedError(null);
    const delay = Math.floor(Math.random() * 4000) + 3000;
    try {
      const activeItems = items.filter(item => item.closing_cases !== "" || item.closing_bottles !== "");
      const apiDate = normalizeDate(reportDate);
      
      const submitLogic = async () => {
          const reportRes = await fetch(`${API_BASE}${view === "edit" ? "/seller/sell-report/edit-last" : "/seller/sell-report"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ report_date: apiDate, items: activeItems.map(item => ({ stock_id: item.stock_id, closing_cases: Number(item.closing_cases) || 0, closing_bottles: Number(item.closing_bottles) || 0 })) })
          });
          if (!reportRes.ok) throw await reportRes.json();

          const financePayload = {
            report_date: apiDate,
            phonepay_entries: (settlement.phonepay_entries || []).filter(e => e.date && Number(e.amount) > 0).map(e => ({ date: e.date, amount: Number(e.amount) })),
            cash_entries: (settlement.cash_entries || []).filter(e => e.date && Number(e.amount) > 0).map(e => ({ date: e.date, amount: Number(e.amount) })),
            expenses: settlement.expenses.filter(e => e.name.trim() && Number(e.amount) > 0).map(e => ({ name: e.name.trim(), amount: Number(e.amount) })),
            outside_income: settlement.outside_income.filter(i => i.name.trim() && Number(i.amount) > 0).map(i => ({ name: i.name.trim(), amount: Number(i.amount) }))
          };

          const financeRes = await fetch(`${API_BASE}/seller/sell-finance`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify(financePayload)
          });
          if (!financeRes.ok) throw await financeRes.json();
      };

      await Promise.all([submitLogic(), new Promise(r => setTimeout(r, delay))]);
      toast.success("Submitted successfully!"); 
      setSettlement({ lastBalance: 0, upi_phonepay: "", phonepay_entries: [{ date: "", amount: "" }], cash: "", cash_entries: [{ date: "", amount: "" }], expenses: [{ name: "", amount: "" }], outside_income: [{ name: "", amount: "" }] });
      setItems(prev => prev.map(item => ({ ...item, closing_cases: "", closing_bottles: "" })));
      setView("history"); setStep(1); fetchHistory();
    } catch (err) { 
        const msg = err.error || err.message || "Submission failed";
        setError(msg);
        setDetailedError(err);
        toast.error(msg); 
    } finally { setSubmitting(false); setIsProcessing(false); }
  };

  const handleDownload = async (date) => {
    try {
      const res = await fetch(`${API_BASE}/reports/sell-reports/${date}/pdf`, { headers: { "Authorization": token } });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `sell_report_${date}.pdf`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); a.remove();
    } catch (err) { toast.error(err.message); }
  };

  const handleViewPdf = async (date) => {
    try {
      const res = await fetch(`${API_BASE}/reports/sell-reports/${date}/pdf`, { headers: { "Authorization": token } });
      if (!res.ok) throw new Error("Failed to load PDF");
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteReport = async (date) => {
    if (!window.confirm(`Delete Report for ${date}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reports/sell-reports/${date}`, { method: "DELETE", headers: { "Authorization": token } });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted successfully"); fetchHistory();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteFinance = async (date) => {
    if (!window.confirm(`Reset Finance for ${date}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/sell-finance/${date}`, { method: "DELETE", headers: { "Authorization": token } });
      if (!res.ok) throw new Error("Reset failed");
      toast.success("Reset successfully"); fetchHistory();
    } catch (err) { toast.error(err.message); }
  };

  // --- Render ---

  return (
    <div className="sell-report-page">
      {isProcessing && <ProcessingOverlay message="Submitting Daily Report..." />}
      {detailedError && <ErrorModal errorData={detailedError} items={items} onClose={() => setDetailedError(null)} />}
      <StatementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAction={handleStatementAction}
        title="Generate Sell Statement"
      />
      <header className="page-header">
        <div className="header-content">
          <div><h1>Daily Sell Report</h1><p className="text-muted">{new Date().toDateString()}</p></div>
          <div className="flex-gap">
             {view === "history" ? (
                <>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                      <FileText size={16}/> Generate Statement
                    </button>
                    {user?.role === "supervisor" && (
                      <button className="btn-primary" onClick={() => { setView("create"); setStep(1); }}>
                        <ShoppingCart size={16}/> Create Report
                      </button>
                    )}
                    {canEditLast && (
                      <button className="btn-secondary" onClick={() => { setView("edit"); setStep(1); }}>
                        <Edit size={16}/> Edit Last Report
                      </button>
                    )}
                </>
             ) : (
               <button className="btn-secondary" onClick={() => setView("history")}>
                <History size={16}/> View History
               </button>
             )}
          </div>
        </div>
      </header>

      {error && <div className="error-banner"><AlertCircle size={16}/> {error}</div>}

      <div className="report-main-content">
        {view === "history" ? (
          <HistoryView 
            reportHistory={reportHistory} currency={currency} onDownload={handleDownload} 
            onView={handleViewPdf} isAdmin={isAdmin} onDeleteReport={handleDeleteReport} 
            onDeleteFinance={handleDeleteFinance} 
          />
        ) : (
          <div className="report-container fade-in">
            <div className="step-indicator mb-4">
              <div className={`step-pill ${step === 1 ? 'active' : 'completed'}`}>1. Stock Entry</div>
              <div className="step-line"></div>
              <div className={`step-pill ${step === 2 ? 'active' : ''}`}>2. Settlement</div>
            </div>

            {step === 1 ? (
              <StockEntryForm 
                view={view} reportDate={reportDate} reportExistsForDate={reportExistsForDate} user={user} 
                setView={setView} loading={loading} processedItems={processedItems} 
                handleInputChange={handleInputChange} number={number} currency={currency} 
                totalSellItems={totalSellItems} totalSellAmount={totalSellAmount} goToStep2={goToStep2}
                sortConfig={sortConfig} handleSort={handleSort} search={search} setSearch={setSearch}
                nextStepError={nextStepError} disableNextStep={loading || !!nextStepError}
                sortMode={sortMode} setSortMode={setSortMode} baseReportDate={baseReportDate}
                handleDateChange={handleDateChange}
              />
            ) : (
              <SettlementForm 
                settlement={settlement} setSettlement={setSettlement} totalSellAmount={totalSellAmount}
                currency={currency} setStep={setStep} handleFullSubmit={handleFullSubmit} submitting={submitting}
                reportDate={reportDate} previousReportDate={previousReportDate} lastInvoiceDate={lastInvoiceDate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellReport;
