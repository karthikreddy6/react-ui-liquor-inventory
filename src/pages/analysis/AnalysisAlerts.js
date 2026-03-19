import React from "react";
import { Activity, AlertTriangle, Info, DollarSign } from "lucide-react";

const AnalysisAlerts = ({ messages }) => {
  if (!messages.low_stock?.length && !messages.high_stock?.length && !messages.finance?.length) return null;

  return (
    <div className="card message-area mb-4">
      <div className="card-header-accent">
        <Activity size={18} /> <h3>Operational Insights & Alerts</h3>
      </div>
      <div className="message-grid p-3">
         {messages.low_stock.map((msg, i) => (
            <div key={`l-${i}`} className="msg-box low-stock-msg">
               <AlertTriangle size={16} className="text-danger" /> <span>{msg}</span>
            </div>
         ))}
         {messages.high_stock.map((msg, i) => (
            <div key={`h-${i}`} className="msg-box high-stock-msg">
               <Info size={16} className="text-info" /> <span>{msg}</span>
            </div>
         ))}
         {messages.finance.map((msg, i) => (
            <div key={`f-${i}`} className="msg-box finance-msg">
               <DollarSign size={16} className="text-primary" /> <span>{msg}</span>
            </div>
         ))}
      </div>
    </div>
  );
};

export default AnalysisAlerts;
