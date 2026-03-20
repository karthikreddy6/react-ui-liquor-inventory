import React from "react";
import { ShoppingCart, X, History, Save, ArrowLeft } from "lucide-react";
import { formatDateForDisplay, normalizeDate, isISODate, preventWheelNumberChange } from "./SellReportUtils";

const SettlementForm = ({
  settlement, setSettlement, totalSellAmount, currency, setStep, handleFullSubmit,
  submitting, reportDate, previousReportDate, lastInvoiceDate, baseReportDate
}) => {
  const minFinanceEntryDate = normalizeDate(previousReportDate || baseReportDate || reportDate || "");
  const maxCollectionDate = normalizeDate(reportDate || "");

  const phonepayEntries = settlement.phonepay_entries || [];
  const normalizedPhonepayEntries = phonepayEntries
    .map((entry) => ({
      date: (entry?.date || "").trim(),
      amount: Number(entry?.amount) || 0
    }))
    .filter((entry) =>
      isISODate(entry.date) &&
      entry.amount > 0 &&
      (!minFinanceEntryDate || entry.date >= minFinanceEntryDate) &&
      (!maxCollectionDate || entry.date <= maxCollectionDate)
    );
  const phonepayTotal = normalizedPhonepayEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const fallbackPhonepay = Number(settlement.upi_phonepay) || 0;
  const effectivePhonepay = normalizedPhonepayEntries.length > 0 ? phonepayTotal : fallbackPhonepay;

  const cashEntries = settlement.cash_entries || [];
  const normalizedCashEntries = cashEntries
    .map((entry) => ({
      date: (entry?.date || "").trim(),
      amount: Number(entry?.amount) || 0
    }))
    .filter((entry) =>
      isISODate(entry.date) &&
      entry.amount > 0 &&
      (!minFinanceEntryDate || entry.date >= minFinanceEntryDate) &&
      (!maxCollectionDate || entry.date <= maxCollectionDate)
    );
  const cashTotal = normalizedCashEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const fallbackCash = Number(settlement.cash) || 0;
  const effectiveCash = normalizedCashEntries.length > 0 ? cashTotal : fallbackCash;

  const target = totalSellAmount - (Number(settlement.lastBalance) || 0);
  const outsideIncomeTotal = (settlement.outside_income || []).reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  const collection = effectivePhonepay + effectiveCash + outsideIncomeTotal;
  const diff = target - collection;
  const expensesTotal = settlement.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
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
              
              {/* PhonePe Section */}
              <div className="phonepay-section">
                <div className="phonepay-section-head">
                  <span className="label">PhonePe (UPI)</span>
                  <button
                    className="btn-add-small"
                    onClick={() => setSettlement((p) => ({
                      ...p,
                      phonepay_entries: [...(p.phonepay_entries || []), { date: reportDate || "", amount: "" }]
                    }))}
                  >
                    + Add
                  </button>
                </div>
                <div className="phonepay-hint">
                  Date must be between <strong>{formatDateForDisplay(minFinanceEntryDate)}</strong> and <strong>{formatDateForDisplay(maxCollectionDate)}</strong>.
                </div>
                <div className="phonepay-list">
                  {(settlement.phonepay_entries || []).map((entry, idx) => (
                    <div key={idx} className="phonepay-row">
                      <input
                        type="date"
                        className="exp-name phonepay-date"
                        value={entry.date || ""}
                        min={minFinanceEntryDate || undefined}
                        max={maxCollectionDate || undefined}
                        required
                        onChange={(e) => {
                          const next = [...(settlement.phonepay_entries || [])];
                          next[idx] = { ...next[idx], date: e.target.value };
                          setSettlement((p) => ({ ...p, phonepay_entries: next }));
                        }}
                      />
                      <input
                        type="number"
                        className="exp-amount phonepay-amount"
                        placeholder="0"
                        value={entry.amount || ""}
                        onWheel={preventWheelNumberChange}
                        onChange={(e) => {
                          const next = [...(settlement.phonepay_entries || [])];
                          next[idx] = { ...next[idx], amount: e.target.value };
                          setSettlement((p) => ({ ...p, phonepay_entries: next }));
                        }}
                      />
                      <button
                        className="btn-remove"
                        onClick={() => {
                          const next = (settlement.phonepay_entries || []).filter((_, i) => i !== idx);
                          setSettlement((p) => ({ ...p, phonepay_entries: next }));
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="settlement-row total-row phonepay-total-row">
                  <span className="label">PhonePe Total:</span>
                  <span className="value">{currency.format(effectivePhonepay)}</span>
                </div>
              </div>

              {/* Cash Section */}
              <div className="phonepay-section">
                <div className="phonepay-section-head">
                  <span className="label">Cash Collected</span>
                  <button
                    className="btn-add-small"
                    onClick={() => setSettlement((p) => ({
                      ...p,
                      cash_entries: [...(p.cash_entries || []), { date: reportDate || "", amount: "" }]
                    }))}
                  >
                    + Add
                  </button>
                </div>
                <div className="phonepay-hint">
                  Date must be between <strong>{formatDateForDisplay(minFinanceEntryDate)}</strong> and <strong>{formatDateForDisplay(maxCollectionDate)}</strong>.
                </div>
                <div className="phonepay-list">
                  {(settlement.cash_entries || []).map((entry, idx) => (
                    <div key={idx} className="phonepay-row">
                      <input
                        type="date"
                        className="exp-name phonepay-date"
                        value={entry.date || ""}
                        min={minFinanceEntryDate || undefined}
                        max={maxCollectionDate || undefined}
                        required
                        onChange={(e) => {
                          const next = [...(settlement.cash_entries || [])];
                          next[idx] = { ...next[idx], date: e.target.value };
                          setSettlement((p) => ({ ...p, cash_entries: next }));
                        }}
                      />
                      <input
                        type="number"
                        className="exp-amount phonepay-amount"
                        placeholder="0"
                        value={entry.amount || ""}
                        onWheel={preventWheelNumberChange}
                        onChange={(e) => {
                          const next = [...(settlement.cash_entries || [])];
                          next[idx] = { ...next[idx], amount: e.target.value };
                          setSettlement((p) => ({ ...p, cash_entries: next }));
                        }}
                      />
                      <button
                        className="btn-remove"
                        onClick={() => {
                          const next = (settlement.cash_entries || []).filter((_, i) => i !== idx);
                          setSettlement((p) => ({ ...p, cash_entries: next }));
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="settlement-row total-row phonepay-total-row">
                  <span className="label">Cash Total:</span>
                  <span className="value">{currency.format(effectiveCash)}</span>
                </div>
              </div>

              {/* Outside Income Section */}
              <div className="phonepay-section">
                <div className="phonepay-section-head">
                  <span className="label text-success">Outside Income</span>
                  <button
                    className="btn-add-small"
                    style={{ background: '#10b981' }}
                    onClick={() => setSettlement((p) => ({
                      ...p,
                      outside_income: [...(p.outside_income || []), { name: "", amount: "" }]
                    }))}
                  >
                    + Add
                  </button>
                </div>
                <div className="phonepay-list">
                  {(settlement.outside_income || []).map((inc, idx) => (
                    <div key={idx} className="phonepay-row">
                      <input
                        type="text"
                        className="exp-name"
                        placeholder="Label (e.g. Extra Credit)"
                        value={inc.name || ""}
                        onChange={(e) => {
                          const next = [...(settlement.outside_income || [])];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setSettlement((p) => ({ ...p, outside_income: next }));
                        }}
                      />
                      <input
                        type="number"
                        className="exp-amount phonepay-amount"
                        placeholder="0"
                        value={inc.amount || ""}
                        onWheel={preventWheelNumberChange}
                        onChange={(e) => {
                          const next = [...(settlement.outside_income || [])];
                          next[idx] = { ...next[idx], amount: e.target.value };
                          setSettlement((p) => ({ ...p, outside_income: next }));
                        }}
                      />
                      <button
                        className="btn-remove"
                        onClick={() => {
                          const next = (settlement.outside_income || []).filter((_, i) => i !== idx);
                          setSettlement((p) => ({ ...p, outside_income: next }));
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="settlement-row total-row phonepay-total-row">
                  <span className="label">Income Total:</span>
                  <span className="value text-success">{currency.format(outsideIncomeTotal)}</span>
                </div>
              </div>

              <hr className="my-4" />
              <div className="settlement-row total-row">
                <span className="label">Total Collection (UPI+Cash+Inc):</span>
                <span className="value text-success fw-bold">{currency.format(collection)}</span>
              </div>
              <div className="settlement-row total-row secondary">
                <span className="label">After Settlement (Shortage):</span>
                <span className={`value ${diff > 0 ? 'text-danger' : 'text-success'}`}>{currency.format(diff)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settlement-side">
          <div className="card settlement-card mb-4">
            <div className="card-header-accent">
              <History size={18} />
              <div className="flex-between w-full">
                <h3>2. Outbound Expenses</h3>
                <button className="btn-add-small" onClick={() => setSettlement(p => ({ ...p, expenses: [...p.expenses, { name: "", amount: "" }] }))}>+ Add</button>
              </div>
            </div>
            <div className="card-body">
              <div className="expenditure-items">
                {settlement.expenses.map((exp, idx) => (
                  <div key={idx} className="exp-item-row mb-2">
                    <input type="text" className="exp-name" placeholder="Label" value={exp.name} onChange={(e) => {
                      const news = [...settlement.expenses]; news[idx].name = e.target.value; setSettlement(p => ({ ...p, expenses: news }));
                    }} />
                    <input type="number" className="exp-amount" placeholder="0" value={exp.amount} onWheel={preventWheelNumberChange} onChange={(e) => {
                      const news = [...settlement.expenses]; news[idx].amount = e.target.value; setSettlement(p => ({ ...p, expenses: news }));
                    }} />
                    <button className="btn-remove" onClick={() => {
                      const news = settlement.expenses.filter((_, i) => i !== idx); setSettlement(p => ({ ...p, expenses: news }));
                    }}><X size={14} /></button>
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
            <span className="label">Target</span>
            <span className="value">{currency.format(target)}</span>
          </div>
          <div className="math-operator">-</div>
          <div className="summary-stat">
            <span className="label">Collection</span>
            <span className="value text-success">{currency.format(collection)}</span>
          </div>
          <div className="math-operator">=</div>
          <div className="summary-stat">
            <span className="label">Shortage</span>
            <span className={`value ${diff > 0 ? 'text-danger' : 'text-success'}`}>{currency.format(diff)}</span>
          </div>
          <div className="math-operator">-</div>
          <div className="summary-stat">
            <span className="label">Expenses</span>
            <span className="value">{currency.format(expensesTotal)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className={`final-balance-box ${final > 0 ? 'negative' : 'positive'}`}>
            <span className="label">Final Unexplained Balance</span>
            <span className="value">{currency.format(final)}</span>
          </div>
        </div>
        <div className="summary-actions">
          <button className="btn-secondary" onClick={() => setStep(1)} disabled={submitting}><ArrowLeft size={18} className="mr-2" /> Back</button>
          <button className="btn-primary btn-submit-final" onClick={handleFullSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : <><Save size={20} /> Submit Report</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementForm;
