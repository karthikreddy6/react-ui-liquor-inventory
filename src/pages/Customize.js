import React from "react";
import { Settings, List, Type, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CustomizeOption = ({ title, description, icon: Icon, onClick, index }) => (
  <motion.div 
    className="card customize-option-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    onClick={onClick}
    style={{ 
      cursor: 'pointer',
      padding: '2rem',
      borderRadius: '20px',
      border: '1px solid #f1f5f9',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      position: 'relative'
    }}
  >
    <div 
      className="stat-icon" 
      style={{ 
        backgroundColor: "#4f46e510", 
        color: "#4f46e5", 
        width: '56px', 
        height: '56px', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <Icon size={28} strokeWidth={2.5} />
    </div>
    
    <div style={{ flex: 1 }}>
      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{title}</h3>
      <p className="text-muted" style={{ margin: '0.75rem 0 0 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{description}</p>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', color: '#4f46e5', fontWeight: '700', fontSize: '0.9rem', gap: '0.5rem' }}>
      Configure <ChevronRight size={16} strokeWidth={3} />
    </div>
  </motion.div>
);

const Customize = () => {
  const navigate = useNavigate();
  const options = [
    { 
      title: "Custom List View", 
      description: "Customize the order of brands in your sell reports.", 
      icon: List,
      onClick: () => navigate("/customize/list-view")
    },
    { 
      title: "Custom Brand Name", 
      description: "Rename or add aliases to your stock brands for easier searching.", 
      icon: Type,
      onClick: () => navigate("/customize/brand-name")
    }
  ];

  return (
    <div className="customize-page fade-in">
      <header className="page-header">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex-align-center mb-1">
            <Settings size={20} className="text-primary mr-2" />
            <h1 style={{ margin: 0 }}>Customize Settings</h1>
          </div>
          <p className="text-muted">Personalize your inventory management experience.</p>
        </motion.div>
      </header>

      <div className="customize-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        {options.map((opt, i) => (
          <CustomizeOption key={i} {...opt} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Customize;
