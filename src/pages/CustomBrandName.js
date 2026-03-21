import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Search, X, Edit3, Type, Tag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import { toast } from "react-hot-toast";

const CustomBrandName = () => {
  const { token, logout } = useAuth();
  const [brands, setBrands] = useState([]);
  const [aliases, setAliases] = useState({}); // Map of brand_number -> short_name
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(null); 
  const [newAlias, setNewAlias] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAliases = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/seller/sell-report/brand-aliases`, {
        headers: { "Authorization": token }
      });
      if (res.status === 401) { logout(); return; }
      if (res.ok) {
        const data = await res.json();
        // Use the brand_aliases object directly as requested
        setAliases(data.brand_aliases || {});
      }
    } catch (err) {
      console.error("Failed to fetch aliases", err);
    }
  }, [token, logout]);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seller/sell-report/brands`, {
        headers: { "Authorization": token }
      });
      if (res.status === 401) { logout(); return; }
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || data || []);
      }
    } catch (err) {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchBrands();
      fetchAliases();
    }
  }, [token, fetchBrands, fetchAliases]);

  const handleSetAlias = async () => {
    if (!newAlias.trim()) {
      toast.error("Short name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/seller/sell-report/brand-alias`, {
        method: "POST",
        headers: { "Authorization": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_number: showEditModal.brand_number,
          short_name: newAlias.trim()
        })
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Failed to save alias");
      setAliases(prev => ({ ...prev, [showEditModal.brand_number]: newAlias.trim() }));
      setShowEditModal(null);
      toast.success(`Short name saved for ${showEditModal.brand_name}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlias = async (brandNumber) => {
    if (!window.confirm("Remove this short name?")) return;
    try {
      const res = await fetch(`${API_BASE}/seller/sell-report/brand-alias/${brandNumber}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error("Failed to delete alias");
      const next = { ...aliases };
      delete next[brandNumber];
      setAliases(next);
      toast.success("Short name removed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredBrands = useMemo(() => {
    const s = search.toLowerCase();
    return brands.filter(b => 
      b.brand_name?.toLowerCase().includes(s) || 
      b.brand_number?.toString().includes(s) ||
      aliases[b.brand_number]?.toLowerCase().includes(s)
    );
  }, [brands, search, aliases]);

  return (
    <div className="custom-brand-page fade-in">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Custom Brand Names</h1>
            <p className="text-muted">Personalize brand names for your reports. BP for Blenders Pride, etc.</p>
          </div>
        </div>
      </header>

      {/* Summary Section */}
      {Object.keys(aliases).length > 0 && (
        <div className="card mb-4" style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
            <div className="flex-align-center mb-3">
                <Tag size={18} className="text-primary mr-2" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Active Short Names ({Object.keys(aliases).length})</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(aliases).map(([num, name]) => (
                    <div key={num} className="alias-chip" style={{ 
                        background: 'white', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <span style={{ fontWeight: '800', color: '#4f46e5' }}>{name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{num}</span>
                        <button onClick={() => handleDeleteAlias(num)} style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#ef4444' }} title="Remove Alias">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="card table-card">
        <div className="table-controls p-4">
          <div className="search-wrap">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search brand..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="sell-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Original Name</th>
                <th>Short Name (Alias)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5">Loading brands...</td></tr>
              ) : filteredBrands.length > 0 ? (
                filteredBrands.map(brand => (
                  <tr key={brand.brand_number}>
                    <td className="fw-bold text-primary">#{brand.brand_number}</td>
                    <td>{brand.brand_name}</td>
                    <td>
                      {aliases[brand.brand_number] ? (
                        <span className="badge" style={{ background: '#4f46e515', color: '#4f46e5', fontWeight: '800', padding: '6px 14px', borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #4f46e530' }}>
                          {aliases[brand.brand_number]}
                        </span>
                      ) : (
                        <span className="text-muted italic text-small">Not set</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex-gap justify-end">
                        <button 
                          className="btn-icon" style={{ background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '10px' }}
                          title="Set/Change Short Name"
                          onClick={() => {
                            setShowEditModal(brand);
                            setNewAlias(aliases[brand.brand_number] || ""); // SHOW LAST TIME NAME
                          }}
                        >
                          <Edit3 size={18} />
                        </button>
                        {aliases[brand.brand_number] && (
                          <button 
                            className="btn-icon text-danger" style={{ background: '#fff1f2', width: '36px', height: '36px', borderRadius: '10px' }}
                            title="Delete Short Name"
                            onClick={() => handleDeleteAlias(brand.brand_number)}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5">No brands found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Alias Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', borderRadius: '24px' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: '800' }}>{aliases[showEditModal.brand_number] ? "Update Short Name" : "Set Short Name"}</h3>
              <button className="btn-close" onClick={() => setShowEditModal(null)}><X size={24}/></button>
            </div>
            <div className="modal-body">
              <div className="mb-4 p-3" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                <label className="text-small text-muted mb-1 d-block">Original Brand:</label>
                <div className="fw-bold">{showEditModal.brand_name}</div>
                <div className="text-small text-primary fw-bold mt-1">Code: #{showEditModal.brand_number}</div>
              </div>
              
              <div className="form-group">
                <label className="fw-bold mb-2 d-block">Custom Short Name:</label>
                <div style={{ position: 'relative' }}>
                  <Type size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}/>
                  <input 
                    type="text" className="form-control" placeholder="e.g. BP, RS, 8PM..." 
                    value={newAlias} onChange={(e) => setNewAlias(e.target.value.toUpperCase())}
                    style={{ paddingLeft: '2.8rem', borderRadius: '12px', height: '48px', fontSize: '1.1rem', fontWeight: '700' }}
                    autoFocus maxLength={60}
                  />
                </div>
                {aliases[showEditModal.brand_number] && (
                    <p className="text-small text-primary mt-2 fw-bold">Current alias: {aliases[showEditModal.brand_number]}</p>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ background: '#f8fafc' }}>
              <button className="btn-secondary" onClick={() => setShowEditModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSetAlias} disabled={saving || !newAlias.trim()}>
                {saving ? "Saving..." : "Save Short Name"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomBrandName;
