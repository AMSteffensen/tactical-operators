import React from 'react';
import { useSocket } from '../hooks/useSocket';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Component that displays the real-time connection status
 * Shows connection state, errors, and reconnection attempts
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false,
  className = ''
}) => {
  const { status } = useSocket();
  
  
  
  const getStatusText = () => {
    if (status.isConnected) return 'Connected';
    if (status.error) return 'Connection Error';
    if (status.reconnectAttempts > 0) return 'Reconnecting...';
    return 'Connecting...';
  };
  
  const getStatusIcon = () => {
    if (status.isConnected) return '🟢';
    if (status.error) return '🔴';
    return '🟡';
  };
  
  return (
    <div className={`connection-status ${className}`}>
      <div className="status-main">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>
      
      {showDetails && (
        <div className="status-details">
          {status.socketId && (
            <div className="detail-item">
              <span className="detail-label">Socket ID:</span>
              <span className="detail-value">{status.socketId.slice(0, 8)}...</span>
            </div>
          )}
          
          {status.reconnectAttempts > 0 && (
            <div className="detail-item">
              <span className="detail-label">Reconnect attempts:</span>
              <span className="detail-value">{status.reconnectAttempts}</span>
            </div>
          )}
          
          {status.error && (
            <div className="detail-item error">
              <span className="detail-label">Error:</span>
              <span className="detail-value">{status.error}</span>
            </div>
          )}
        </div>
      )}
      
      import './ConnectionStatus.css';
    </div>
  );
};
