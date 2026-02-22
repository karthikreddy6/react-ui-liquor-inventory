import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Edit3, Lock, FileText, RefreshCw } from "lucide-react";
import { API_BASE } from "../../apiConfig";
import { toast } from "react-hot-toast";

const isISODate = (value) => /^\d{4}-\d{2}-\d{2}$/.test((value || "").trim());

const AdminTools = ({ token, isBasicAuth }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invLoading, setInvLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports/invoices`, {
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : (data.items || []));
    } catch (err) { console.error(err); }
    finally { setInvLoading(false); }
  }, [token]);

  useEffect(() => {
    if (isBasicAuth) fetchInvoices();
  }, [isBasicAuth, fetchInvoices]);

  const handleDeleteAction = async (endpoint, identifier) => {
    if (!window.confirm(`Are you sure you want to delete ${identifier}?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Deleted: ${identifier}`);
      if (endpoint.includes("invoices")) fetchInvoices();
    } catch (err) {
      toast.error(`Delete error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ... (handleEditStock remains same)

  const handleEditStock = async () => {
    const stockId = window.prompt("Enter Stock ID to edit:");
    if (!stockId) return;
    const cases = window.prompt("Enter new Total Cases:");
    const bottles = window.prompt("Enter new Total Bottles:");
    const rate = window.prompt("Enter new Rate per Case:");

    if (cases === null || bottles === null || rate === null) return;
    const casesValue = Number(cases);
    const bottlesValue = Number(bottles);
    const rateValue = Number(rate);

    if (![casesValue, bottlesValue, rateValue].every(Number.isFinite)) {
      toast.error("Enter valid numeric values.");
      return;
    }
    if (casesValue < 0 || bottlesValue < 0 || rateValue < 0) {
      toast.error("Values must be non-negative.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stock/${stockId}`, {
        method: "PATCH",
        headers: { 
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          total_cases: casesValue,
          total_bottles: bottlesValue,
          rate_per_case: rateValue
        })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Stock updated successfully.");
    } catch (err) {
      toast.error(`Update error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-tools-layout fade-in">
      <div className="admin-grid">
        {/* Left Side: General Tools */}
        <div className="tools-sidebar">
            <div className="card h-full">
                <div className="card-header"><Edit3 size={20} className="text-primary"/> <h3>System Tools</h3></div>
                <div className="management-actions mt-4">
                    <div className="action-row py-3 border-bottom">
                        <div className="fw-bold text-small">Manual Stock Override</div>
                        <p className="text-muted text-xs mb-2">Directly fix stock counts by ID.</p>
                        <button className="btn-outline btn-sm w-full" disabled={!isBasicAuth || actionLoading} onClick={handleEditStock}><Edit3 size={14} className="mr-1"/> Edit Stock</button>
                    </div>
                    <div className="action-row py-3">
                        <div className="fw-bold text-small">Quick Deletes</div>
                        <p className="text-muted text-xs mb-2">Delete data by entering date/number.</p>
                        <div className="flex-gap">
                            <button className="btn-secondary btn-sm flex-1" disabled={!isBasicAuth} onClick={() => {
                                const date = window.prompt("Report Date:");
                                if (!date) return;
                                if (!isISODate(date)) {
                                  toast.error("Enter date in YYYY-MM-DD format.");
                                  return;
                                }
                                handleDeleteAction(`/admin/reports/sell-reports/${date}`, date);
                            }}>Report</button>
                            <button className="btn-secondary btn-sm flex-1" disabled={!isBasicAuth} onClick={() => {
                                const date = window.prompt("Finance Date:");
                                if (!date) return;
                                if (!isISODate(date)) {
                                  toast.error("Enter date in YYYY-MM-DD format.");
                                  return;
                                }
                                handleDeleteAction(`/admin/sell-finance/${date}`, date);
                            }}>Finance</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Invoice Management */}
        <div className="invoice-management">
            <div className="card">
                <div className="card-header flex-between">
                    <div className="flex-align-center"><FileText size={20} className="text-primary mr-2"/> <h3>Invoice Records</h3></div>
                    <button className="btn-icon" onClick={fetchInvoices} disabled={!isBasicAuth || invLoading}><RefreshCw size={16} className={invLoading ? "spin" : ""}/></button>
                </div>
                
                {!isBasicAuth ? (
                    <div className="empty-state p-5">
                        <Lock size={32} className="text-muted mb-2"/>
                        <p>System Admin access required to manage invoices.</p>
                    </div>
                ) : invLoading ? (
                    <div className="p-5 text-center text-muted">Loading invoices...</div>
                ) : (
                    <div className="table-responsive max-h-400">
                        <table className="text-small">
                            <thead>
                                <tr>
                                    <th>Invoice No</th>
                                    <th>Date</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, i) => (
                                    <tr key={i}>
                                        <td className="fw-bold">{inv.invoice_number}</td>
                                        <td className="text-muted">{inv.invoice_date}</td>
                                        <td className="text-right">
                                            <button className="btn-icon text-danger" onClick={() => handleDeleteAction(`/admin/invoices/${inv.invoice_number}`, inv.invoice_number)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {invoices.length === 0 && <tr><td colSpan="3" className="text-center p-4">No invoices found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTools;
