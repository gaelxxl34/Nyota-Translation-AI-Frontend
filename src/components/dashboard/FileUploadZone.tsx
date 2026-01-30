// File Upload Zone Component
// Drag & drop and file selection area for document uploads

import React from 'react';
import { useTranslation } from 'react-i18next';

interface FileUploadZoneProps {
  isUploading: boolean;
  uploadStage: string | null;
  uploadProgress: number;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  isUploading,
  uploadStage,
  uploadProgress,
  onFileSelect,
  onDragOver,
  onDrop,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
        isUploading
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-500'
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isUploading ? (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {t('dashboard.upload.processing')}
          </h3>
          <p className="text-gray-600">
            {uploadStage || t('dashboard.upload.preparingUpload')}
          </p>
          <div className="w-full max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {uploadProgress}% {t('dashboard.upload.completed')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('dashboard.upload.dragDrop')}
          </h3>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp"
            className="hidden"
            id="file-upload"
            onChange={onFileSelect}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            {t('dashboard.upload.selectFile')}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            {t('dashboard.upload.supportedFormats')}
          </p>
        </>
      )}
    </div>
  );
};

export default FileUploadZone;
