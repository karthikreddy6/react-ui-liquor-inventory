import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorModal = ({ errorData, onClose, items = [] }) => {
  if (!errorData) return null;
  
  const isDetailed = errorData.debug && errorData.error;
  const targetItem = isDetailed ? items.find(it => it.stock_id === errorData.debug.stock_id) : null;
  
  return (
    <div className="modal-overlay" style={{ zIndex: 11000 }}>
      <div className="modal-content" style={{ maxWidth: '650px', borderRadius: '12px', border: 'none' }}>
        <div className="modal-header" style={{ background: '#ef4444', color: 'white', padding: '1.25rem 1.5rem' }}>
          <div className="flex-align-center">
            <AlertCircle size={24} className="mr-2" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>Submission Failed</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24}/></button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '500' }}>The server rejected the report with the following validation error:</p>
            <div style={{ background: '#fff1f2', border: '1.5px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#991b1b', fontWeight: '700', fontSize: '1.05rem' }}>
              {errorData.error || errorData.message || "Unknown Error"}
            </div>
          </div>

          {targetItem && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
               <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: '700' }}>Affected Product</h4>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>{targetItem.brand_name}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>#{targetItem.brand_number}</div>
               </div>
            </div>
          )}
          
          {isDetailed && (
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: '700' }}>Inventory Discrepancy Details</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                {[
                  { label: "Closing Cases", val: errorData.debug.closing_cases, color: '#ef4444' },
                  { label: "Total Avail (Cs)", val: errorData.debug.total_cases, color: '#10b981' },
                  { label: "Closing Bottles", val: errorData.debug.closing_bottles, color: '#ef4444' },
                  { label: "Total Avail (Bt)", val: errorData.debug.total_bottles, color: '#10b981' },
                  { label: "Pack Size", val: errorData.debug.pack_size_case, color: '#64748b' },
                  { label: "Opening (Bt)", val: errorData.debug.opening_bottles, color: '#64748b' }
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.label}:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: stat.color }}>{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ background: '#f8fafc', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontWeight: '700' }}>Close & Fix Entry</button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
