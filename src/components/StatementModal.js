import React, { useState } from "react";
import { X, Calendar, FileText, Download, Eye } from "lucide-react";

const StatementModal = ({ isOpen, onClose, onAction, title }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (type) => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
      return;
    }
    onAction(fromDate, toDate, type);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 11000 }}>
      <div className="modal-content" style={{ maxWidth: '450px', borderRadius: '12px', border: 'none' }}>
        <div className="modal-header" style={{ background: 'var(--primary)', color: 'white', padding: '1rem 1.5rem' }}>
          <div className="flex-align-center">
            <Calendar size={20} className="mr-2" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>{title || "Generate Statement"}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20}/></button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div className="form-group mb-3">
            <label className="d-block mb-1 text-small fw-bold">From Date:</label>
            <input 
              type="date" 
              className="form-control" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
          </div>
          <div className="form-group mb-4">
            <label className="d-block mb-1 text-small fw-bold">To Date:</label>
            <input 
              type="date" 
              className="form-control" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => handleSubmit('view')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Eye size={18} /> View PDF
            </button>
            <button className="btn-primary" onClick={() => handleSubmit('download')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementModal;
