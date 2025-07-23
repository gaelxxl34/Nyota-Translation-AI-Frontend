// QRCode Component for NTC Document Verification
// Uses server-side generated QR codes from the backend API

import React, { useState, useEffect } from 'react';

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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 QRCodeComponent - documentId:', documentId);
  
  useEffect(() => {
    if (!documentId) {
      console.warn('❌ QRCodeComponent - Missing documentId');
      setError('No document ID provided');
      setIsLoading(false);
      return;
    }

    const loadQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Backend QR endpoint
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const qrImageUrl = `${backendUrl}/api/qr/${documentId}`;
        
        console.log('🔗 QRCodeComponent - Fetching QR from backend URL:', qrImageUrl);

        // Fetch the QR code image and convert to base64
        const response = await fetch(qrImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch QR code: ${response.status}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setQrDataUrl(dataUrl);
          setIsLoading(false);
          console.log('✅ QRCodeComponent - QR code converted to base64 data URL');
        };
        
        reader.onerror = () => {
          setError('Failed to convert QR code to data URL');
          setIsLoading(false);
          console.error('❌ QRCodeComponent - Failed to convert to data URL');
        };
        
        reader.readAsDataURL(blob);
        
      } catch (err) {
        console.error('❌ QRCodeComponent - Failed to load QR code:', err);
        setError('Failed to load QR code');
        setIsLoading(false);
      }
    };

    loadQRCode();
  }, [documentId]);

  if (!documentId || error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span>{error || 'No ID'}</span>
      </div>
    );
  }

  if (isLoading || !qrDataUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-block qr-container print-qr-force-visible ${className}`}
      data-print-element="qr-container"
      style={{
        display: 'inline-block',
        visibility: 'visible',
        opacity: 1,
        backgroundColor: 'transparent',
        padding: '2px',
        position: 'relative',
        zIndex: 9999
      }}
    >
      <img 
        src={qrDataUrl}
        alt={`QR Code for document ${documentId}`}
        className="rounded print:block print-qr-force-visible"
        data-print-element="qr-image"
        style={{ 
          width: size, 
          height: size,
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          filter: 'none',
          transform: 'none',
          position: 'static',
          zIndex: 9999
        }}
      />
    </div>
  );
};

export default QRCodeComponent;
