export const getStockLevelColor = (level) => {
  switch (level) {
    case "low": return "text-danger bg-danger-light";
    case "high": return "text-info bg-info-light";
    case "zero": return "text-warning bg-warning-light";
    default: return "text-success bg-success-light";
  }
};

export const getCoverageColor = (ratio) => {
  if (ratio < 0.5) return "text-danger fw-bold";
  if (ratio < 1) return "text-warning fw-bold";
  if (ratio > 2) return "text-info fw-bold";
  return "text-success fw-bold";
};

export const getGapColor = (gap) => {
  if (gap < 0) return "text-danger";
  if (gap > 0) return "text-info";
  return "text-muted";
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
     const d = new Date(dateStr);
     if (isNaN(d.getTime())) return dateStr;
     return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch(e) { return dateStr; }
};

export const currencyFormatter = new Intl.NumberFormat("en-IN", { 
  style: "currency", 
  currency: "INR", 
  maximumFractionDigits: 0 
});

export const numberFormatter = new Intl.NumberFormat("en-IN");
