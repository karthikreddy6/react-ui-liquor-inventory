import React from "react";
import { Wallet, Clock, FileText, ShoppingCart, CheckCircle, History, ArrowDownRight, ArrowUpRight, MinusCircle, PlusCircle } from "lucide-react";
import { currencyFormatter, numberFormatter, formatDate } from "./AnalysisUtils";

const FinancePanel = ({ finance }) => {
  const latest = finance.latest_finance || {};
  
  return (
    <div className="side-col">
      <section className="card finance-panel sticky-top pro-finance-panel">
        <div className="card-header-accent pro-header">
           <Wallet size={18} className="text-primary" /> 
           <h3>Latest Settlement Audit</h3>
        </div>
        
        {/* Detailed Breakup of Last Report */}
        <div className="settlement-breakdown p-3">
           <div className="breakdown-row mb-2">
              <span className="label">Stock Sell Amount</span>
              <span className="value fw-bold">{currencyFormatter.format(latest.total_sell_amount || 0)}</span>
           </div>
           
           <div className="breakdown-items-list mb-3">
              <div className="item flex-between">
                 <span className="flex-align-center text-xs text-muted"><ArrowUpRight size={12} className="mr-1 text-primary"/> UPI (Digital)</span>
                 <span className="text-xs fw-bold">{currencyFormatter.format(latest.upi_phonepay || 0)}</span>
              </div>
              <div className="item flex-between">
                 <span className="flex-align-center text-xs text-muted"><ArrowUpRight size={12} className="mr-1 text-success"/> Cash Collected</span>
                 <span className="text-xs fw-bold">{currencyFormatter.format(latest.cash || 0)}</span>
              </div>
              {latest.total_outside_income > 0 && (
                <div className="item flex-between">
                   <span className="flex-align-center text-xs text-muted"><PlusCircle size={12} className="mr-1 text-info"/> Outside Income</span>
                   <span className="text-xs fw-bold">+{currencyFormatter.format(latest.total_outside_income)}</span>
                </div>
              )}
              {latest.total_expenses > 0 && (
                <div className="item flex-between">
                   <span className="flex-align-center text-xs text-muted"><MinusCircle size={12} className="mr-1 text-danger"/> Expenses</span>
                   <span className="text-xs fw-bold">-{currencyFormatter.format(latest.total_expenses)}</span>
                </div>
              )}
           </div>

           <div className={`gap-status-box ${latest.final_balance < 0 ? 'negative' : 'positive'}`}>
              <div className="flex-between align-center">
                 <span className="status-label">{latest.final_balance < 0 ? 'SHORTAGE (GAP)' : 'SURPLUS'}</span>
                 <span className="status-value">{currencyFormatter.format(latest.final_balance || 0)}</span>
              </div>
           </div>
        </div>

        <hr className="m-0 opacity-10" />

        <div className="latest-status-section p-3">
           <h4 className="section-title"><Clock size={14} className="mr-1"/> Latest Activity</h4>
           
           <div className="status-widget mb-3">
              <div className="widget-icon"><FileText size={16}/></div>
              <div className="widget-body">
                 <span className="widget-label">Last Invoice</span>
                 <span className="widget-value">{latest.report_date === finance.latest_invoice?.invoice_date ? "Today" : finance.latest_invoice?.invoice_date}</span>
                 <span className="widget-sub text-muted">No: {finance.latest_invoice?.invoice_number}</span>
              </div>
           </div>

           <div className="status-widget mb-3">
              <div className="widget-icon"><ShoppingCart size={16}/></div>
              <div className="widget-body">
                 <span className="widget-label">Last Sell Report</span>
                 <span className="widget-value">{formatDate(finance.latest_sell_report?.report_date)}</span>
                 <span className="widget-sub text-muted">{numberFormatter.format(finance.latest_sell_report?.total_items || 0)} Brands Sold</span>
              </div>
           </div>
        </div>

        <div className="history-section p-3">
           <h4 className="section-title"><History size={14} className="mr-1"/> Audit History</h4>
           <div className="mini-history">
              {finance.recent_finance.map((f, i) => (
                 <div key={i} className="history-row">
                    <span className="date">{f.report_date.split('-').slice(1).reverse().join(' ')}</span>
                    <span className="amount">{currencyFormatter.format(f.total_sell_amount)}</span>
                    <span className={`bal ${f.final_balance < 0 ? 'neg' : 'pos'}`}>{f.final_balance}</span>
                 </div>
              ))}
           </div>
        </div>
      </section>
      <style>{`
        .pro-finance-panel { border-radius: 16px; border: 1.5px solid #e2e8f0; }
        .settlement-breakdown .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; }
        .breakdown-items-list { background: #f8fafc; padding: 0.75rem; border-radius: 10px; display: flex; flex-direction: column; gap: 6px; }
        
        .gap-status-box { padding: 0.75rem 1rem; border-radius: 10px; }
        .gap-status-box.negative { background: #fff1f2; border: 1px solid #fecaca; color: #991b1b; }
        .gap-status-box.positive { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        
        .gap-status-box .status-label { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.05em; }
        .gap-status-box .status-value { font-size: 1.1rem; font-weight: 900; }
      `}</style>
    </div>
  );
};

export default FinancePanel;
