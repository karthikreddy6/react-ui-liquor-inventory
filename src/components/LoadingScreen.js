import React from 'react';
import { motion } from 'framer-motion';
import { Wine } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          marginBottom: '16px',
          border: '1px solid #f1f5f9'
        }}>
          <Wine size={32} style={{ color: '#4f46e5' }} />
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            color: '#64748b',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Royal Wines
        </motion.div>
      </motion.div>
      
      <div style={{
        position: 'absolute',
        bottom: '40px',
        display: 'flex',
        gap: '6px'
      }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#818cf8',
              borderRadius: '50%'
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
