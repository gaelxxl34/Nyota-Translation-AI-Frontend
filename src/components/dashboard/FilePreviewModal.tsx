// File Preview Modal Component
// Modal for previewing uploaded files before processing

import React from 'react';
import type { FormType } from '../../types/bulletin';

// Helper function to get form type display name
const getFormTypeDisplayName = (formType: FormType): string => {
  const displayNames: Record<FormType, string> = {
    form4: 'Formulaire 4',
    form6: 'Formulaire 6',
    collegeTranscript: 'Relevé de Notes Collège',
    collegeAttestation: 'Attestation Collège',
    stateDiploma: 'Diplôme d\'État',
    bachelorDiploma: 'Diplôme de Licence',
    highSchoolAttestation: 'Attestation Lycée',
    stateExamAttestation: 'Attestation Examen d\'État',
  };
  return displayNames[formType] || formType;
};

interface FilePreviewModalProps {
  show: boolean;
  previewUrl: string | null;
  previewFile: File | null;
  selectedFormType: FormType;
  isUploading: boolean;
  onCancel: () => void;
  onProcess: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  show,
  previewUrl,
  previewFile,
  selectedFormType,
  isUploading,
  onCancel,
  onProcess,
}) => {
  if (!show || !previewUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">📄 Aperçu du Document</h2>
              <p className="text-blue-100 text-sm mt-1">Vérifiez votre document avant le traitement</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-red-200 transition-colors"
              title="Fermer l'aperçu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body - Image Preview */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Aperçu du document"
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>

          {/* File Info */}
          {previewFile && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Nom du Fichier :</span>
                  <p className="text-gray-900 truncate">{previewFile.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Taille du Fichier :</span>
                  <p className="text-gray-900">{(previewFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Type de Fichier :</span>
                  <p className="text-gray-900">{previewFile.type}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Type de Formulaire :</span>
                  <p className="text-gray-900 capitalize">{getFormTypeDisplayName(selectedFormType)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Action Buttons */}
        <div className="bg-gray-100 p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Annuler</span>
          </button>
          <button
            onClick={onProcess}
            disabled={isUploading}
            className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium flex items-center justify-center space-x-2 shadow-md ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Traiter le Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
