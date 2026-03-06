import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";

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
  if (!normalized) return "-";
  const parts = normalized.split("-");
  if (parts.length !== 3) return dateStr || "-";
  const [year, month, day] = parts;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${monthNames[Number(month) - 1] || month}-${year}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const Finance = () => {
  const { token, logout, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("snapshot");
  const [reportDateFilter, setReportDateFilter] = useState("");
  const [overview, setOverview] = useState({
    totals: null,
    latest_invoice: null,
    latest_sell_report: null,
    invoices: [],
    sell_reports: [],
    finance: []
  });

  const currency = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }),
    []
  );

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/seller/sell-finance/overview`, {
        headers: { Authorization: token }
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error("Unable to load finance overview");
      const data = await res.json();
      setOverview({
        totals: data.totals || null,
        latest_invoice: data.latest_invoice || null,
        latest_sell_report: data.latest_sell_report || null,
        invoices: Array.isArray(data.invoices) ? data.invoices : [],
        sell_reports: Array.isArray(data.sell_reports) ? data.sell_reports : [],
        finance: Array.isArray(data.finance) ? data.finance : []
      });
    } catch (err) {
      setError(err.message || "Failed to load finance overview.");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token && (user?.role === "admin" || user?.role === "owner" || user?.role === "supervisor")) {
      fetchOverview();
    }
  }, [token, user, fetchOverview]);

  const metrics = useMemo(() => {
    const latestBal = overview.finance[0]?.final_balance || 0;
    return [
      { label: "Total Invoice Value", value: currency.format(overview.totals?.all_invoices_total_invoice_value || 0) },
      { label: "Total Sell Amount", value: currency.format(overview.totals?.all_sell_amount || 0), className: "text-primary" },
      { label: "Total Balance", value: currency.format(latestBal), className: latestBal < 0 ? "text-danger" : "text-success" },
      { label: "Total TCS", value: currency.format(overview.totals?.all_invoices_tcs || 0) }
    ];
  }, [overview, currency]);

  const filteredFinance = useMemo(() => {
    const query = reportDateFilter.trim().toLowerCase();
    if (!query) return overview.finance;
    return overview.finance.filter((row) => {
      const display = formatDateForDisplay(row.report_date).toLowerCase();
      const raw = (row.report_date || "").toLowerCase();
      return display.includes(query) || raw.includes(query);
    });
  }, [overview.finance, reportDateFilter]);

  const filteredInvoices = useMemo(() => {
    const query = reportDateFilter.trim().toLowerCase();
    if (!query) return overview.invoices;
    return overview.invoices.filter((row) => {
      const display = formatDateForDisplay(row.invoice_date).toLowerCase();
      const num = (row.invoice_number || "").toLowerCase();
      return display.includes(query) || num.includes(query);
    });
  }, [overview.invoices, reportDateFilter]);

  const filteredSellReports = useMemo(() => {
    const query = reportDateFilter.trim().toLowerCase();
    if (!query) return overview.sell_reports;
    return overview.sell_reports.filter((row) => {
      const display = formatDateForDisplay(row.report_date).toLowerCase();
      const raw = (row.report_date || "").toLowerCase();
      return display.includes(query) || raw.includes(query);
    });
  }, [overview.sell_reports, reportDateFilter]);

  if (user?.role === "seller") {
    return (
      <div className="empty-state p-5">
        <AlertCircle size={48} className="text-danger mb-3" />
        <h3>Access Denied</h3>
        <p>You do not have privileges to view financial settlements.</p>
      </div>
    );
  }

  return (
    <div className="finance-page">
      <header className="page-header">
        <div>
          <h1>Finance Overview</h1>
          <p className="text-muted">Aggregated summary of all business financials.</p>
        </div>
        <button className="btn-secondary" onClick={fetchOverview} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </header>

      {error && <div className="error-banner"><AlertCircle size={16} /> {error}</div>}

      <div className="finance-metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="card finance-metric-card">
            <span className="label">{m.label}</span>
            <span className={`value ${m.className || ""}`}>{m.value}</span>
          </div>
        ))}
      </div>

      <div className="card table-card">
        <div className="table-controls">
          <div className="flex-gap">
            <button className={`tab-btn ${activeSection === "snapshot" ? "active" : ""}`} onClick={() => setActiveSection("snapshot")}>Snapshot</button>
            <button className={`tab-btn ${activeSection === "invoices" ? "active" : ""}`} onClick={() => setActiveSection("invoices")}>Invoices</button>
            <button className={`tab-btn ${activeSection === "finance" ? "active" : ""}`} onClick={() => setActiveSection("finance")}>Daily Settlements</button>
            <button className={`tab-btn ${activeSection === "reports" ? "active" : ""}`} onClick={() => setActiveSection("reports")}>Sell Reports</button>
          </div>
          {activeSection !== "snapshot" && (
            <div className="search-wrap compact">
              <input
                type="text"
                value={reportDateFilter}
                onChange={(e) => setReportDateFilter(e.target.value)}
                placeholder="Filter data..."
                className="search-input"
              />
            </div>
          )}
        </div>
      </div>

      {activeSection === "snapshot" && (
        <div className="finance-snapshot-grid">
          <div className="card">
            <div className="table-header"><h3>All-Time Totals</h3></div>
            <div className="finance-kv-list">
              <div><span>Total Invoice Value</span><strong>{currency.format(overview.totals?.all_invoices_total_invoice_value || 0)}</strong></div>
              <div><span>Net Invoice Value</span><strong>{currency.format(overview.totals?.all_invoices_net_invoice_value || 0)}</strong></div>
              <div><span>Total TCS Paid</span><strong>{currency.format(overview.totals?.all_invoices_tcs || 0)}</strong></div>
              <div className="border-top pt-2"><span>All Sell Amount</span><strong className="text-primary">{currency.format(overview.totals?.all_sell_amount || 0)}</strong></div>
              <div><span>Total Outstanding Balance</span><strong className={ (overview.finance[0]?.final_balance || 0) < 0 ? "text-danger" : "text-success" }>{currency.format(overview.finance[0]?.final_balance || 0)}</strong></div>
            </div>
          </div>
          <div className="card">
            <div className="table-header"><h3>Latest Activity</h3></div>
            <div className="finance-kv-list">
              <div className="section-head mt-0">Latest Invoice</div>
              <div><span>Invoice No</span><strong>{overview.latest_invoice?.invoice_number || "-"}</strong></div>
              <div><span>Invoice Date</span><strong>{formatDateForDisplay(overview.latest_invoice?.invoice_date)}</strong></div>
              <div><span>Total Value</span><strong>{currency.format(overview.latest_invoice?.total_invoice_value || 0)}</strong></div>
              
              <div className="section-head">Latest Sell Report</div>
              <div><span>Report Date</span><strong>{formatDateForDisplay(overview.latest_sell_report?.report_date)}</strong></div>
              <div><span>Sell Amount</span><strong>{currency.format(overview.latest_sell_report?.sell_amount || 0)}</strong></div>
              <div><span>Created By</span><strong>{overview.latest_sell_report?.created_by || "-"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "invoices" && (
        <div className="card table-card">
          <div className="table-header"><h3>Invoice History</h3></div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Net Value</th>
                  <th>Cess</th>
                  <th>TCS</th>
                  <th>Total Value</th>
                  <th>Retailer Bal</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv, i) => (
                    <tr key={i}>
                      <td className="fw-bold">{inv.invoice_number}</td>
                      <td>{formatDateForDisplay(inv.invoice_date)}</td>
                      <td>{currency.format(inv.net_invoice_value || 0)}</td>
                      <td>{currency.format(inv.special_excise_cess || 0)}</td>
                      <td>{currency.format(inv.tcs || 0)}</td>
                      <td className="fw-bold">{currency.format(inv.total_invoice_value || 0)}</td>
                      <td>{currency.format(inv.retailer_credit_balance || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "finance" && (
      <div className="card table-card">
        <div className="table-header">
          <h3><Wallet size={18} className="mr-2" /> Daily Financial Settlements</h3>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Report Date</th>
                <th>Total Sell</th>
                <th>UPI/PhPay</th>
                <th>Cash</th>
                <th>Expenses</th>
                <th>Income</th>
                <th>Final Balance</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody>
              {filteredFinance.length > 0 ? (
                filteredFinance.map((row, i) => {
                  return (
                    <tr key={i}>
                      <td className="fw-bold">{formatDateForDisplay(row.report_date)}</td>
                      <td>{currency.format(row.total_sell_amount || 0)}</td>
                      <td>{currency.format(row.upi_phonepay || 0)}</td>
                      <td>{currency.format(row.cash || 0)}</td>
                      <td>{currency.format(row.total_expenses || 0)}</td>
                      <td className="text-success">{currency.format(row.total_outside_income || 0)}</td>
                      <td className={Number(row.final_balance) < 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                        {currency.format(row.final_balance || 0)}
                      </td>
                      <td>{row.updated_by || row.created_by || "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" className="text-center">No finance records found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeSection === "reports" && (
      <div className="card table-card">
        <div className="table-header"><h3>Sell Reports Summary</h3></div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Report Date</th>
                <th>Total Items</th>
                <th>Total Sell Amount</th>
                <th>Last Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellReports.length > 0 ? (
                filteredSellReports.map((row, i) => (
                  <tr key={i}>
                    <td className="fw-bold">{formatDateForDisplay(row.report_date)}</td>
                    <td>{row.total_items || 0}</td>
                    <td>{currency.format(row.total_sell_amount || 0)}</td>
                    <td>{formatDateTime(row.last_created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center">No sell report summary found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default Finance;
