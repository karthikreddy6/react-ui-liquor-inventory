import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// Date Helpers
export const normalizeDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return "";
  const trimmed = dateStr.trim();
  
  // 1. Try to find a date in YYYY-MM-DD format (ISO)
  const isoMatch = trimmed.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }
  
  // 2. Try to find a date in DD-MMM-YYYY format (e.g., 30-Nov-2025)
  const dmyMatch = trimmed.match(/(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})/i);
  if (dmyMatch) {
    const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const monthKey = dmyMatch[2].charAt(0).toUpperCase() + dmyMatch[2].slice(1).toLowerCase();
    return `${dmyMatch[3]}-${months[monthKey] || "01"}-${dmyMatch[1].padStart(2, "0")}`;
  }

  // 3. Try DD-MM-YYYY format
  const dmyNumericMatch = trimmed.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dmyNumericMatch) {
    return `${dmyNumericMatch[3]}-${dmyNumericMatch[2].padStart(2, "0")}-${dmyNumericMatch[1].padStart(2, "0")}`;
  }

  return "";
};

export const formatDateForDisplay = (dateStr) => {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return "None";
  const parts = normalized.split("-");
  if (parts.length !== 3) return normalized;
  const [year, month, day] = parts;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(month) - 1;
  return `${day.padStart(2, "0")}-${monthNames[monthIdx] || month}-${year}`;
};

export const isISODate = (value) => /^\d{4}-\d{2}-\d{2}$/.test((value || "").trim());

export const getSortIcon = (key, sortConfig) => {
    const sort = sortConfig.find(s => s.key === key);
    const priority = sortConfig.findIndex(s => s.key === key);
    if (!sort) return <ChevronsUpDown size={14} className="ml-1 opacity-50" />;
    return (
      <div className="flex-align-center ml-1">
        {sort.direction === 'asc' ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />}
        {sortConfig.length > 1 && <span className="sort-priority-badge">{priority + 1}</span>}
      </div>
    );
};

export const preventWheelNumberChange = (event) => {
    event.currentTarget.blur();
};
