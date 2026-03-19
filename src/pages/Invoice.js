import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Upload, AlertTriangle, Eye, EyeOff, History, Download, Trash2, Edit3, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import ProcessingOverlay from "../components/ProcessingOverlay";
import { toast } from "react-hot-toast";

const ErrorModal = ({ errorData, onClose }) => {
  if (!errorData) return null;
  
  return (
    <div className="modal-overlay" style={{ zIndex: 11000 }}>
      <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '12px', border: 'none' }}>
        <div className="modal-header" style={{ background: '#ef4444', color: 'white', padding: '1.25rem 1.5rem' }}>
          <div className="flex-align-center">
            <AlertTriangle size={24} className="mr-2" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>Processing Failed</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><CheckCircle size={24} style={{ opacity: 0 }}/><AlertTriangle size={24}/></button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>The system encountered an error while processing the invoice:</p>
            <div style={{ background: '#fff1f2', border: '1.5px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#991b1b', fontWeight: '700', fontSize: '1.05rem' }}>
              {errorData.error || errorData.message || "Unknown Error"}
            </div>
          </div>

          {errorData.details && (
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: '700' }}>Error Details</h4>
              <pre style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                overflow: 'auto',
                border: '1px solid #e2e8f0',
                maxHeight: '200px'
              }}>
                {JSON.stringify(errorData.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ background: '#f8fafc', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontWeight: '700' }}>Understand & Close</button>
        </div>
      </div>
    </div>
  );
};

const normalizeDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return "";
  const trimmed = dateStr.trim();
  
  // 1. Try to find a date in YYYY-MM-DD format (ISO)
  const isoMatch = trimmed.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }
  
  // 2. Try to find a date in DD-MMM-YYYY format (e.g., 30-Nov-2025)
  const dmyMatch = trimmed.match(/(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})/i);
  if (dmyMatch) {
    const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const monthKey = dmyMatch[2].charAt(0).toUpperCase() + dmyMatch[2].slice(1).toLowerCase();
    return `${dmyMatch[3]}-${months[monthKey] || "01"}-${dmyMatch[1].padStart(2, "0")}`;
  }

  // 3. Try DD-MM-YYYY format
  const dmyNumericMatch = trimmed.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dmyNumericMatch) {
    return `${dmyNumericMatch[3]}-${dmyNumericMatch[2].padStart(2, "0")}-${dmyNumericMatch[1].padStart(2, "0")}`;
  }

  return "";
};

const formatDateForDisplay = (dateStr) => {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return "None";
  const parts = normalized.split("-");
  if (parts.length !== 3) return normalized;
  const [year, month, day] = parts;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(month) - 1;
  return `${day.padStart(2, "0")}-${monthNames[monthIdx] || month}-${year}`;
};

const isISODate = (value) => /^\d{4}-\d{2}-\d{2}$/.test((value || "").trim());

const Invoice = () => {
  const { token, logout, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [view, setView] = useState("history"); // 'upload', 'history'
  const [file, setFile] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("Processing...");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [detailedError, setDetailedError] = useState(null);
  const [search, setSearch] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [uploadInputKey, setUploadInputKey] = useState(0);

  const resetUploadForm = () => {
    setFile(null);
    setInvoice(null);
    setIsConfirmed(false);
    setError("");
    setDetailedError(null);
    setSearch("");
    setShowRaw(false);
    setUploadInputKey((prev) => prev + 1);
  };

  const handleDeleteInvoice = async (invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Invoice ${invoiceNumber}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/invoices/${invoiceNumber}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Invoice deleted successfully");
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditInvoice = async (inv) => {
    const newNumber = (window.prompt("New Invoice Number:", inv.invoice_number) || "").trim();
    if (!newNumber) return;
    const newDate = (window.prompt("New Invoice Date (YYYY-MM-DD):", inv.invoice_date) || "").trim();
    if (!newDate) return;
    if (!isISODate(newDate)) {
      toast.error("Invoice date must be in YYYY-MM-DD format.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/invoices/${inv.invoice_number}`, {
        method: "PATCH",
        headers: { 
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          invoice_number: newNumber,
          invoice_date: newDate
        })
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Update failed");
      toast.success("Invoice updated successfully");
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/invoices`, {
        headers: { "Authorization": token }
      });
      if (res.ok) {
        const data = await res.json();
        // Handle variations: array, data.items, or data.invoices
        if (Array.isArray(data)) {
          setHistory(data);
        } else if (data.items && Array.isArray(data.items)) {
          setHistory(data.items);
        } else if (data.invoices && Array.isArray(data.invoices)) {
          setHistory(data.invoices);
        } else {
          setHistory([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch invoice history", err);
    }
  }, [token]);

  useEffect(() => {
    if (token && view === "history" && (user?.role === "admin" || user?.role === "owner" || user?.role === "supervisor")) {
      fetchHistory();
    }
  }, [token, view, user, fetchHistory]);

  const filteredItems = useMemo(() => {
    if (!invoice) return [];
    return (invoice.items || []).filter((item) =>
      (item.brand_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [invoice, search]);

  if (user?.role === "seller") {
    return (
      <div className="empty-state p-5">
        <AlertTriangle size={48} className="text-danger mb-3" />
        <h3>Access Denied</h3>
        <p>You do not have privileges to view invoice management.</p>
      </div>
    );
  }

  const previewFile = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (user?.role === "seller") {
      toast.error("Error: Sellers are not authorized to upload invoices.");
      return;
    }

    setLoading(true);
    setProcessingMsg("Analyzing PDF Invoice...");
    setIsProcessing(true);
    setError("");
    setDetailedError(null);
    setInvoice(null);
    setIsConfirmed(false);

    const processingDelay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const previewPromise = fetch(`${API_BASE}/upload/preview`, { 
        method: "POST", 
        headers: { "Authorization": token },
        body: formData 
      });

      const [res] = await Promise.all([
        previewPromise,
        new Promise(resolve => setTimeout(resolve, processingDelay))
      ]);

      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      
      if (!res.ok) {
        throw data; 
      }
      
      const invData = data.preview || data.invoice;
      if (!invData) throw new Error("Invalid response format");

      if (String(invData.retailer?.code || "") !== "2500552") {
         const msg = `Upload Rejected: Retailer code is ${invData.retailer?.code}. Expected 2500552.`;
         setError(msg);
         toast.error(msg);
         setInvoice(null);
         return;
      }
      
      setInvoice(invData);
      toast.success("PDF analyzed! Please review the details.");
    } catch (err) {
      console.error("Preview Error:", err);
      const msg = err.error || err.message || "Something went wrong while processing the PDF";
      setError(msg);
      setDetailedError(err);
      toast.error(msg);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const confirmUpload = async () => {
    if (!file || !invoice) return;

    setLoading(true);
    setProcessingMsg("Saving to Database & Updating Stock...");
    setIsProcessing(true);
    setError("");
    setDetailedError(null);

    const savingDelay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadPromise = fetch(`${API_BASE}/upload`, { 
        method: "POST", 
        headers: { "Authorization": token },
        body: formData 
      });

      const [res] = await Promise.all([
        uploadPromise,
        new Promise(resolve => setTimeout(resolve, savingDelay))
      ]);

      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) throw data;
      
      toast.success("Invoice saved successfully!");
      setIsConfirmed(true);
      fetchHistory(); 
    } catch (err) {
      console.error("Upload Error:", err);
      const msg = err.error || err.message || "Failed to save invoice";
      setDetailedError(err);
      toast.error(msg);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleDownload = async (invoiceNumber) => {
    try {
      const res = await fetch(`${API_BASE}/reports/invoices/${invoiceNumber}/pdf`, {
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      toast.error("Failed to download PDF: " + err.message);
    }
  };

  const handleViewPdf = async (invoiceNumber) => {
    try {
      const res = await fetch(`${API_BASE}/reports/invoices/${invoiceNumber}/pdf`, {
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Failed to load PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Failed to view PDF: " + err.message);
    }
  };

  const HistoryView = () => (
    <div className="card table-card">
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Invoice Date</th>
              <th>Uploaded By</th>
              <th>Retailer Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((inv, i) => (
                <tr key={i}>
                  <td className="fw-bold">{inv.invoice_number}</td>
                  <td>{formatDateForDisplay(inv.invoice_date)}</td>
                  <td>
                    <div>{inv.uploaded_by}</div>
                    <div className="text-small text-muted">{formatDateForDisplay(inv.uploaded_at)}</div>
                  </td>
                  <td>{inv.retailer_code}</td>
                  <td>
                    <div className="flex-gap">
                        <button className="btn-icon" onClick={() => handleViewPdf(inv.invoice_number)} title="View PDF">
                            <Eye size={16} className="text-primary"/>
                        </button>
                        <button className="btn-icon" onClick={() => handleDownload(inv.invoice_number)} title="Download PDF">
                            <Download size={16}/>
                        </button>
                        {isAdmin && (
                            <>
                                <button className="btn-icon" onClick={() => handleEditInvoice(inv)} title="Edit Invoice">
                                    <Edit3 size={16} className="text-primary"/>
                                </button>
                                <button className="btn-icon text-danger" onClick={() => handleDeleteInvoice(inv.invoice_number)} title="Delete Invoice">
                                    <Trash2 size={16}/>
                                </button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center">No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="invoice-page">
      {isProcessing && <ProcessingOverlay message={processingMsg} />}
      {detailedError && <ErrorModal errorData={detailedError} onClose={() => setDetailedError(null)} />}
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Invoice Management</h1>
            <p className="text-muted">Upload and track purchase invoices.</p>
          </div>
          <div className="flex-gap">
            {view === "upload" ? (
              <button className="btn-secondary" onClick={() => setView("history")}>
                <History size={16}/> View History
              </button>
            ) : (
              user?.role !== "seller" && (
                <button className="btn-primary" onClick={() => setView("upload")}>
                  <Upload size={16}/> Upload New
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {view === "history" ? (
        <HistoryView />
      ) : (
        <>
          <div className="upload-section card">
            <div className="drop-zone">
              <input key={uploadInputKey} type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files[0]); setInvoice(null); setIsConfirmed(false); }} id="file-upload" className="file-input" />
              <label htmlFor="file-upload" className="file-label">
                <Upload size={48} className="icon" />
                <span>{file ? file.name : "Click to select a PDF invoice"}</span>
              </label>
            </div>
            
            <div className="flex-gap justify-center mt-4">
                {!invoice && (
                    <button className="btn-primary" onClick={previewFile} disabled={loading || !file}>
                        {loading ? "Analyzing..." : "Analyze PDF Preview"}
                    </button>
                )}
                


                {isConfirmed && (
                    <div className="flex-gap align-center">
                      <div className="text-success fw-bold flex-align-center">
                          <CheckCircle size={20} className="mr-2" /> Invoice Saved Successfully
                      </div>
                      <button className="btn-primary" onClick={resetUploadForm}>
                        Add Another Invoice
                      </button>
                    </div>
                )}
            </div>

            {error && <div className="error-banner mt-4"><AlertTriangle size={16} /> {error}</div>}
          </div>

          {invoice && (
            <div className="invoice-results fade-in">
              <div className="meta-grid">
                <div className="card meta-card">
                  <h3>Invoice Details</h3>
                  <div className="row"><span className="label">No:</span> <span className="value">{invoice.invoice_meta.invoice_number}</span></div>
                  <div className="row"><span className="label">Date:</span> <span className="value">{formatDateForDisplay(invoice.invoice_meta.invoice_date)}</span></div>
                  <div className="row"><span className="label">Retailer:</span> <span className="value">{invoice.retailer.name} ({invoice.retailer.code})</span></div>
                  {invoice.uploaded_by && (
                     <div className="row mt-2 border-top pt-2">
                        <span className="label">Uploaded By:</span> 
                        <span className="value">{invoice.uploaded_by} <small className="text-muted">({formatDateForDisplay(invoice.uploaded_at)})</small></span>
                     </div>
                  )}
                </div>
                
                <div className="card totals-card">
                  <h3>Financials</h3>
                  <div className="totals-grid">
                    {Object.entries(invoice.totals).map(([key, value]) => (
                      <div key={key} className="total-item">
                        <span className="label">{key.replace(/_/g, " ")}</span>
                        <span className="value">{typeof value === "number" ? currency.format(value) : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card table-card">
                <div className="table-header">
                  <h3>Line Items</h3>
                  <div className="search-wrap compact">
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="search-input"
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Product</th>
                        <th>Pack</th>
                        <th>Cases</th>
                        <th>Bottles</th>
                        <th>Rate/Case</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, i) => (
                        <tr key={i}>
                          <td>
                            <div className="fw-bold">{item.brand_name}</div>
                            <div className="text-small text-muted">#{item.brand_number}</div>
                          </td>
                          <td>{item.product_type}</td>
                          <td>{item.pack_type} ({item.pack_size_quantity_ml}ml)</td>
                          <td>{number.format(item.cases_delivered)}</td>
                          <td>{number.format(item.bottles_delivered)}</td>
                          <td>{currency.format(item.rate_per_case || 0)}</td>
                          <td className="fw-bold">{currency.format(item.total_amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="raw-toggle">
                  <button className="btn-text" onClick={() => setShowRaw(!showRaw)}>
                    {showRaw ? <><EyeOff size={16}/> Hide Raw Data</> : <><Eye size={16}/> View Raw Data</>}
                  </button>
                  {showRaw && <pre className="raw-json">{JSON.stringify(invoice, null, 2)}</pre>}
                </div>
              </div>

              {!isConfirmed && (
                <div className="action-buttons-bottom">
                  <button className="btn-secondary" onClick={resetUploadForm}>
                    Cancel
                  </button>
                  <button className="btn-primary bg-success" onClick={confirmUpload} disabled={loading}>
                    {loading ? "Saving..." : "Confirm & Save to Database"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Invoice;
