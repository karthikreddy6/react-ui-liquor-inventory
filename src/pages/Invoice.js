import React, { useState, useMemo } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

const API_BASE = "http://127.0.0.1:5000";

const Invoice = () => {
  const [file, setFile] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const currency = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }), []);
  const number = useMemo(() => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }), []);

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }
    setLoading(true);
    setError("");
    setInvoice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while processing the PDF");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!invoice) return [];
    return invoice.items.filter((item) => item.brand_name.toLowerCase().includes(search.toLowerCase()));
  }, [invoice, search]);

  return (
    <div className="invoice-page">
      <header className="page-header">
        <h1>Invoice Processing</h1>
        <p className="text-muted">Upload and digitize your PDF invoices.</p>
      </header>

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
              <div className="row"><span className="label">Date:</span> <span className="value">{invoice.invoice_meta.invoice_date}</span></div>
              <div className="row"><span className="label">Retailer:</span> <span className="value">{invoice.retailer.name} ({invoice.retailer.code})</span></div>
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
              <input 
                type="text" 
                placeholder="Search items..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="search-input"
              />
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
    </div>
  );
};

export default Invoice;
