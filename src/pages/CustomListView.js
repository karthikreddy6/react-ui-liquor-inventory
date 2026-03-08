import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Search, X, GripVertical, AlertCircle, RefreshCw, Eraser } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const CustomListView = () => {
  const { token, logout } = useAuth();
  const [availableBrands, setAvailableBrands] = useState([]);
  const [lastSavedList, setLastSavedList] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  // Fetch all brands available
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seller/sell-report/brands`, {
        headers: { "Authorization": token }
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Failed to fetch brands");
      const data = await res.json();
      setAvailableBrands(data.brands || data || []);
      
      if (data.last_custom_list_preview) {
        const preview = data.last_custom_list_preview.map(item => ({
          brand_number: item.brand_number,
          brand_name: item.display_brand_name || item.brand_name
        }));
        setLastSavedList(preview);
        // On first load, if we have a saved list, use it as the default edit state
        setSelectedBrands(preview);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchBrands();
    }
  }, [token, fetchBrands]);

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const brand_order = selectedBrands.map(b => b.brand_number);
      const res = await fetch(`${API_BASE}/seller/sell-report/sort-order`, {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ brand_order })
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Failed to save custom order");
      
      // Update the "last saved" state to match what we just saved
      setLastSavedList([...selectedBrands]);
      toast.success("Custom list order saved successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addBrand = (brand) => {
    if (selectedBrands.some(b => b.brand_number === brand.brand_number)) {
      toast.error("This brand is already in your custom list.");
      return;
    }
    setSelectedBrands([...selectedBrands, { 
        brand_number: brand.brand_number, 
        brand_name: brand.brand_name 
    }]);
    setShowAddModal(false);
    toast.success(`${brand.brand_name} added.`);
  };

  const removeBrand = (index) => {
    const next = [...selectedBrands];
    next.splice(index, 1);
    setSelectedBrands(next);
  };

  const restoreLastSaved = () => {
    if (lastSavedList.length === 0) {
        toast.error("No saved list found to restore.");
        return;
    }
    setSelectedBrands([...lastSavedList]);
    toast.success("Last saved order restored.");
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear the entire list? This allows you to start fresh.")) {
        setSelectedBrands([]);
        toast.success("List cleared. You can now start fresh.");
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...selectedBrands];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setSelectedBrands(next);
  };

  const moveDown = (index) => {
    if (index === selectedBrands.length - 1) return;
    const next = [...selectedBrands];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setSelectedBrands(next);
  };

  const filteredAvailable = useMemo(() => {
    const s = brandSearch.toLowerCase();
    return availableBrands.filter(b => 
      b.brand_name?.toLowerCase().includes(s) || 
      b.brand_number?.toString().includes(s)
    ).filter(b => !selectedBrands.some(s => s.brand_number === b.brand_number));
  }, [availableBrands, brandSearch, selectedBrands]);

  return (
    <div className="custom-list-page fade-in">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Custom Brand Order</h1>
            <p className="text-muted">Arrange brands for your sell report. Just brand name and code.</p>
          </div>
          <div className="flex-gap">
            {selectedBrands.length === 0 && lastSavedList.length > 0 && (
                <button className="btn-secondary" onClick={restoreLastSaved} style={{ borderStyle: 'dashed', borderColor: '#4f46e5', color: '#4f46e5' }}>
                    <RefreshCw size={16} className="mr-2"/> Restore Last Saved
                </button>
            )}
            <button className="btn-secondary" onClick={clearAll} disabled={selectedBrands.length === 0}>
              <Eraser size={16}/> Clear List
            </button>
            <button className="btn-secondary" onClick={() => setShowAddModal(true)} disabled={loading}>
              <Plus size={16}/> Add Brand
            </button>
            <button className="btn-primary" onClick={handleSaveOrder} disabled={saving}>
              <Save size={16}/> {saving ? "Saving..." : "Save Order"}
            </button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner"><AlertCircle size={16}/> {error}</div>}

      <div className="custom-list-container">
        {selectedBrands.length > 0 ? (
          <div className="card custom-order-card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <div className="list-items-container">
              {selectedBrands.map((brand, index) => (
                <div key={brand.brand_number} className="custom-order-item" style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '1.25rem',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div className="drag-handle text-muted" style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', cursor: 'default' }}>
                    <GripVertical size={20}/>
                  </div>
                  
                  <div className="item-index" style={{ 
                    background: '#4f46e510', 
                    color: '#4f46e5', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '800',
                    margin: '0 1rem'
                  }}>{index + 1}</div>

                  <div className="item-info" style={{ flex: 1 }}>
                    <div className="brand-name" style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>{brand.brand_name}</div>
                    <div className="brand-code" style={{ color: '#4f46e5', fontWeight: '700', fontSize: '0.85rem', marginTop: '2px' }}>
                      Code: {brand.brand_number}
                    </div>
                  </div>

                  <div className="item-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-icon" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => moveUp(index)} disabled={index === 0}>
                      <ArrowUp size={16} strokeWidth={2.5}/>
                    </button>
                    <button className="btn-icon" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => moveDown(index)} disabled={index === selectedBrands.length - 1}>
                      <ArrowDown size={16} strokeWidth={2.5}/>
                    </button>
                    <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }}></div>
                    <button className="btn-icon text-danger" style={{ background: '#fff1f2' }} onClick={() => removeBrand(index)}>
                      <Trash2 size={16} strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card empty-state p-5 text-center">
            <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <RefreshCw size={40} className="text-muted"/>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Start Fresh</h3>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>Your custom list is currently empty. Add brands to define your preferred sell report order.</p>
            <div className="flex-gap justify-center">
                {lastSavedList.length > 0 && (
                    <button className="btn-secondary" onClick={restoreLastSaved} style={{ padding: '0.8rem 2rem', borderStyle: 'dashed' }}>
                        <RefreshCw size={20} className="mr-2"/> Restore Last Saved
                    </button>
                )}
                <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '0.8rem 2rem' }}>
                    <Plus size={20} className="mr-2" strokeWidth={3}/> Add Brands
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content brand-select-modal" style={{ borderRadius: '24px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1.5rem 2rem' }}>
              <h3 style={{ fontWeight: '800' }}>Select Brand</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}><X size={24}/></button>
            </div>
            <div className="modal-body" style={{ padding: '0 2rem 2rem' }}>
              <div className="search-wrap mb-4">
                <Search size={18} className="search-icon"/>
                <input 
                  type="text" 
                  placeholder="Search brand name or code..." 
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  style={{ borderRadius: '12px', padding: '0.8rem 0.8rem 0.8rem 2.8rem' }}
                  autoFocus
                />
              </div>
              <div className="brand-grid">
                {filteredAvailable.length > 0 ? (
                  filteredAvailable.map(brand => (
                    <div key={brand.brand_number} className="brand-option-card" onClick={() => addBrand(brand)} style={{ borderRadius: '14px', padding: '1rem 1.25rem' }}>
                      <div className="brand-name" style={{ fontWeight: '700' }}>{brand.display_brand_name || brand.brand_name}</div>
                      <div className="brand-code" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: '600' }}>#{brand.brand_number}</div>
                      <Plus size={18} className="plus-icon"/>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 text-muted">
                    {availableBrands.length === 0 ? "Loading brands..." : "No matching brands found."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomListView;
