import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Upload, AlertTriangle, Eye, EyeOff, History, Download, Trash2, Edit3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import ProcessingOverlay from "../components/ProcessingOverlay";
import { toast } from "react-hot-toast";

const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };
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

const Invoice = () => {
  const { token, logout, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [view, setView] = useState("history"); // 'upload', 'history'
  const [file, setFile] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showRaw, setShowRaw] = useState(false);

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
    const newNumber = window.prompt("New Invoice Number:", inv.invoice_number);
    if (newNumber === null) return;
    const newDate = window.prompt("New Invoice Date (YYYY-MM-DD):", inv.invoice_date);
    if (newDate === null) return;

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
    if (token && view === "history") {
      fetchHistory();
    }
  }, [token, view, fetchHistory]);

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (user?.role === "seller") {
      toast.error("Error: Sellers are not authorized to upload invoices.");
      return;
    }

    setLoading(true);
    setIsProcessing(true);
    setError("");
    setInvoice(null);

    // Random delay between 4-10 seconds
    const processingDelay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadPromise = fetch(`${API_BASE}/upload`, { 
        method: "POST", 
        headers: {
            "Authorization": token
        },
        body: formData 
      });

      // Wait for both the upload and the artificial delay
      const [res] = await Promise.all([
        uploadPromise,
        new Promise(resolve => setTimeout(resolve, processingDelay))
      ]);

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }
      
      // Client-side validation of retailer code
      if (data.invoice?.retailer?.code !== "2500552") {
         const msg = `Upload Rejected: Retailer code is ${data.invoice?.retailer?.code}. Expected 2500552.`;
         setError(msg);
         toast.error(msg);
         setInvoice(null);
         return;
      }
      
      setInvoice(data.invoice);
      toast.success("Invoice processed successfully!");
    } catch (err) {
      console.error(err);
      const msg = err.message || "Something went wrong while processing the PDF";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!invoice) return [];
    return invoice.items.filter((item) => item.brand_name.toLowerCase().includes(search.toLowerCase()));
  }, [invoice, search]);

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
      alert("Failed to download PDF: " + err.message);
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
      {isProcessing && <ProcessingOverlay message="Analyzing PDF Invoice..." />}
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
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} id="file-upload" className="file-input" />
              <label htmlFor="file-upload" className="file-label">
                <Upload size={48} className="icon" />
                <span>{file ? file.name : "Click to select a PDF invoice"}</span>
              </label>
            </div>
            <button className="btn-primary" onClick={uploadFile} disabled={loading || !file}>
              {loading ? "Processing..." : "Upload & Convert"}
            </button>
            {error && <div className="error-banner"><AlertTriangle size={16} /> {error}</div>}
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Invoice;