import React from "react";
import { Eye, Download, RefreshCw, Trash2 } from "lucide-react";
import { formatDateForDisplay } from "./SellReportUtils";

const HistoryView = ({ reportHistory, currency, onDownload, onView, isAdmin, onDeleteReport, onDeleteFinance }) => (
  <div className="card table-card fade-in">
     <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Report Date</th>
              <th>Created By</th>
              <th>Items</th>
              <th>Surplus/Deficit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportHistory.length > 0 ? (
              reportHistory.map((report, i) => (
                <tr key={i}>
                  <td className="fw-bold">{formatDateForDisplay(report.report_date)}</td>
                  <td>
                    <div>{report.created_by}</div>
                    <div className="text-small text-muted">{report.created_at}</div>
                  </td>
                  <td>{report.total_items}</td>
                  <td className={report.finance?.total_balance < 0 ? "text-danger" : "text-success"}>
                    {report.finance ? currency.format(report.finance.total_balance) : "-"}
                  </td>
                  <td>
                    {report.edit_count > 0 ? <span className="badge warning">Edited</span> : <span className="badge success">Final</span>}
                  </td>
                  <td>
                    <div className="flex-gap">
                        <button className="btn-icon" onClick={() => onView(report.report_date)} title="View PDF">
                            <Eye size={20} className="text-primary"/>
                        </button>
                        <button className="btn-icon" onClick={() => onDownload(report.report_date)} title="Download PDF">
                            <Download size={20}/>
                        </button>
                        {isAdmin && (
                            <>
                                <button className="btn-icon" onClick={() => onDeleteFinance(report.report_date)} title="Reset Finance (Delete Finance Only)">
                                    <RefreshCw size={20} className="text-primary"/>
                                </button>
                                <button className="btn-icon text-danger" onClick={() => onDeleteReport(report.report_date)} title="Delete Full Report">
                                    <Trash2 size={20}/>
                                </button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-5 text-muted">No reports found in history.</td></tr>
            )}
          </tbody>
        </table>
     </div>
  </div>
);

export default HistoryView;
