import React from 'react';
import { getApiConfig } from '../services/apiConfig';

/**
 * Debug component to display current API configuration
 * Add this component to any page to see the current environment setup
 */
export const ApiConfigDebug: React.FC = () => {
  const config = getApiConfig();
  
  const envVars = {
    VITE_PR_NUMBER: import.meta.env.VITE_PR_NUMBER,
    VITE_VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  };

  const styles = {
    container: {
      position: 'fixed' as const,
      top: '10px',
      right: '10px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 9999,
      border: '1px solid #333',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    title: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#4CAF50',
    },
    section: {
      marginBottom: '12px',
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      marginBottom: '6px',
      color: '#2196F3',
    },
    item: {
      marginBottom: '4px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    key: {
      color: '#FFC107',
      marginRight: '8px',
    },
    value: {
      color: '#E0E0E0',
      wordBreak: 'break-all' as const,
      maxWidth: '200px',
    },
    url: {
      color: '#4CAF50',
    },
    closeButton: {
      position: 'absolute' as const,
      top: '5px',
      right: '8px',
      background: 'none',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '16px',
    },
  };

  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) {
    return (
      <button
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 9999,
        }}
        onClick={() => setIsVisible(true)}
      >
        Show API Debug
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <button
        style={styles.closeButton}
        onClick={() => setIsVisible(false)}
      >
        ×
      </button>
      
      <div style={styles.title}>🔧 API Configuration Debug</div>
      
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Environment Variables:</div>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={styles.item}>
            <span style={styles.key}>{key}:</span>
            <span style={styles.value}>{value || 'undefined'}</span>
          </div>
        ))}
      </div>
      
      <div style={styles.section}>
        <div style={styles.sectionTitle}>API Configuration:</div>
        {Object.entries(config).map(([key, value]) => (
          <div key={key} style={styles.item}>
            <span style={styles.key}>{key}:</span>
            <span style={{
              ...styles.value,
              ...(value.includes('railway.app') ? styles.url : {})
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Page Info:</div>
        <div style={styles.item}>
          <span style={styles.key}>URL:</span>
          <span style={styles.value}>{window.location.href}</span>
        </div>
        <div style={styles.item}>
          <span style={styles.key}>Host:</span>
          <span style={styles.value}>{window.location.host}</span>
        </div>
      </div>
    </div>
  );
};
