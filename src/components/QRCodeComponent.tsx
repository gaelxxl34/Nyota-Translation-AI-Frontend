// QRCode Component for NTC Document Verification
// Uses server-side generated QR codes from the backend API

import React from 'react';

interface QRCodeComponentProps {
  documentId: string;
  size?: number;
  className?: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ 
  documentId, 
  size = 100, 
  className = ''
}) => {
  console.log('🔍 QRCodeComponent - documentId:', documentId);
  
  if (!documentId) {
    console.warn('❌ QRCodeComponent - Missing documentId');
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span>No ID</span>
      </div>
    );
  }

  // Backend QR endpoint - directly use as image source
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
  const qrImageUrl = `${backendUrl}/api/qr/${documentId}`;
  
  console.log('🔗 QRCodeComponent - Using backend QR URL:', qrImageUrl);

  return (
    <div className={`inline-block ${className}`}>
      <img 
        src={qrImageUrl}
        alt={`QR Code for document ${documentId}`}
        className="rounded"
        style={{ width: size, height: size }}
        onLoad={() => console.log('✅ QRCodeComponent - QR image loaded from backend')}
        onError={(e) => {
          console.error('❌ QRCodeComponent - Backend QR image failed to load:', e);
          // Try to provide more debug info
          console.error('❌ QR URL that failed:', qrImageUrl);
        }}
      />
    </div>
  );
};

export default QRCodeComponent;
