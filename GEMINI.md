# Inventory Management System (React UI)

A comprehensive inventory management system for liquor warehouses, featuring real-time stock tracking, invoice processing, and daily sell reporting.

## Project Overview

- **Frontend:** React 19 SPA bootstrapped with Create React App.
- **Backend:** Flask REST API (default: `http://127.0.0.1:5000`).
- **Core Functionality:** Stock management, automated PDF invoice ingestion, daily sales reconciliation, and financial reporting.
- **Target Users:** Sellers (field staff), Supervisors (operational management), Owners (business oversight), and Admins (system control).

## Architecture & Tech Stack

### Core Technologies
- **UI Library:** React 19
- **Routing:** React Router 7
- **Styling:** Custom CSS with a focus on modern, responsive design.
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Notifications:** React Hot Toast

### Project Structure
- `src/components/`: Reusable UI elements (Loading screens, overlays, sidebar).
- `src/context/`: Global state management, primarily `AuthContext` for user roles and tokens.
- `src/layouts/`: Common page wrappers (e.g., `DashboardLayout`).
- `src/pages/`: Feature-specific views (Dashboard, Stock, Invoice, Sell Report, Admin).
- `src/apiConfig.js`: Centralized API configuration.

## Key Workflows

### 1. Authentication & Role-Based Access Control (RBAC)
- **Seller:** View stock, update daily sales counts.
- **Supervisor:** Upload invoices, generate daily sell reports.
- **Owner:** Upload invoices, edit latest sell reports (once), full financial visibility.
- **Admin:** System-wide overrides, direct stock adjustments (via Basic Auth).

### 2. Stock Management
- Real-time inventory list with multi-column hierarchical sorting.
- Searchable by brand name or brand number.
- "Short View" vs "Full View" toggle for optimized data display.

### 3. Sell Reporting
- **Two-Step Process:** 
    1. **Stock Entry:** Closing stock counts (validated against opening and added stock).
    2. **Settlement:** Reconciliation of digital (UPI) vs. cash collections, including outbound expense logging.
- **Validation:** Enforces report generation against the last invoice date to ensure data continuity.

### 4. Invoice Processing
- Support for automated PDF extraction (via `extract_pdf.py` and `process_pdf.py` on the backend).
- Restricted to specific retailer codes (e.g., 2500552) for data integrity.

## Development Guide

### Building and Running
- `npm start`: Launches the development server at `http://localhost:3000`.
- `npm run build`: Generates a production-ready bundle in the `build/` directory.
- `npm test`: Executes the test suite using Jest.

### Coding Conventions
- **Functional Components:** Prefer functional components with hooks (`useState`, `useMemo`, `useCallback`, `useEffect`).
- **CSS:** Use modular CSS or the established patterns in `App.css`.
- **API Interaction:** All requests should utilize the `token` from `AuthContext` and reference `API_BASE` from `apiConfig.js`.
- **Data Safety:** Follow the established date normalization patterns for cross-platform compatibility (DD-MMM-YYYY for display, YYYY-MM-DD for API).

## Important Files
- `src/App.js`: Routing and private route wrappers.
- `src/context/AuthContext.js`: Handles JWT and Basic Auth flows.
- `src/pages/SellReport.js`: Complex two-step form logic for daily settlements.
- `seller_api_notes.txt`: Detailed API interaction rules and error codes.
- `react_updates.txt`: Recent feature flags and business logic changes.
