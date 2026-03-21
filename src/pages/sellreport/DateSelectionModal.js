import React, { useState } from "react";
import { X, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { formatDateForDisplay, normalizeDate } from "./SellReportUtils";

const DateSelectionModal = ({ isOpen, onClose, onConfirm, baseReportDate }) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const [selectedDate, setSelectedDate] = useState(todayStr);

  if (!isOpen) return null;

  const isInvalid = selectedDate && baseReportDate && (
    normalizeDate(selectedDate) < normalizeDate(baseReportDate) || 
    normalizeDate(selectedDate) > normalizeDate(todayStr)
  );

  const handleConfirm = () => {
    if (isInvalid) return;
    onConfirm(selectedDate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="flex-align-center">
            <Calendar size={20} className="text-primary mr-2" />
            <h3>Select Report Date</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="d-block mb-2">Choose the date for this report:</label>
            <input 
              type="date" 
              className={`form-control ${isInvalid ? 'border-danger' : ''}`}
              value={selectedDate}
              min={baseReportDate}
              max={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="mt-3 p-3 bg-light rounded">
            <div className="flex-between text-small mb-1">
              <span className="text-muted">Minimum Allowed:</span>
              <span className="fw-bold">{formatDateForDisplay(baseReportDate)}</span>
            </div>
            <div className="flex-between text-small">
              <span className="text-muted">Maximum Allowed:</span>
              <span className="fw-bold">{formatDateForDisplay(todayStr)}</span>
            </div>
          </div>

          {isInvalid && (
            <div className="alert-warning-small mt-3">
              <AlertCircle size={14} />
              <span>Date must be between {formatDateForDisplay(baseReportDate)} and {formatDateForDisplay(todayStr)}.</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={handleConfirm}
            disabled={!selectedDate || isInvalid}
          >
            Proceed <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelectionModal;
