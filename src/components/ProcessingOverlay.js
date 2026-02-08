import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wine } from 'lucide-react';

const ProcessingOverlay = ({ message = "Processing data..." }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '2.5rem',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={64} className="text-primary" style={{ opacity: 0.2 }} />
          </motion.div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#4f46e5'
          }}>
            <Wine size={32} />
          </div>
        </div>
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
          {message}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Please wait while we sync your inventory.
        </p>
        
        <div style={{ display: 'flex', gap: '4px', marginTop: '1.5rem' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4f46e5' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProcessingOverlay;
