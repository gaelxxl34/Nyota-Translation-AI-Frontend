// Document Type Selector Component
// Grid of document type cards for selection

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FormType } from '../../types/bulletin';

// Document type configuration
const documentTypes: Array<{
  type: FormType;
  colorScheme: string;
  selectedBg: string;
  selectedText: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'form4',
    colorScheme: 'emerald',
    selectedBg: 'border-emerald-500 bg-emerald-50',
    selectedText: 'text-emerald-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    type: 'form6',
    colorScheme: 'blue',
    selectedBg: 'border-blue-500 bg-blue-50',
    selectedText: 'text-blue-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    type: 'collegeTranscript',
    colorScheme: 'indigo',
    selectedBg: 'border-indigo-500 bg-indigo-50',
    selectedText: 'text-indigo-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    type: 'collegeAttestation',
    colorScheme: 'teal',
    selectedBg: 'border-teal-500 bg-teal-50',
    selectedText: 'text-teal-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    ),
  },
  {
    type: 'stateDiploma',
    colorScheme: 'purple',
    selectedBg: 'border-purple-500 bg-purple-50',
    selectedText: 'text-purple-700',
    icon: (
      <>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </>
    ),
  },
  {
    type: 'bachelorDiploma',
    colorScheme: 'amber',
    selectedBg: 'border-amber-500 bg-amber-50',
    selectedText: 'text-amber-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    ),
  },
  {
    type: 'highSchoolAttestation',
    colorScheme: 'rose',
    selectedBg: 'border-rose-500 bg-rose-50',
    selectedText: 'text-rose-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    type: 'stateExamAttestation',
    colorScheme: 'cyan',
    selectedBg: 'border-cyan-500 bg-cyan-50',
    selectedText: 'text-cyan-700',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
];

// Get color classes based on color scheme
const getColorClasses = (colorScheme: string, isSelected: boolean) => {
  const colors: Record<string, { iconBg: string; iconBgSelected: string }> = {
    emerald: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-emerald-500' },
    blue: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-blue-500' },
    indigo: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-indigo-500' },
    teal: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-teal-500' },
    purple: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-purple-500' },
    amber: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-amber-500' },
    rose: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-rose-500' },
    cyan: { iconBg: 'bg-gray-100 group-hover:bg-gray-200', iconBgSelected: 'bg-cyan-500' },
  };
  const colorConfig = colors[colorScheme] || colors.blue;
  return isSelected ? colorConfig.iconBgSelected : colorConfig.iconBg;
};

const getSubtitleColorClass = (colorScheme: string, isSelected: boolean) => {
  if (!isSelected) return 'text-gray-500';
  const colors: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    teal: 'text-teal-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    cyan: 'text-cyan-600',
  };
  return colors[colorScheme] || 'text-gray-500';
};

const getCheckmarkBgClass = (colorScheme: string) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
  };
  return colors[colorScheme] || 'bg-blue-500';
};

interface DocumentTypeSelectorProps {
  selectedFormType: FormType;
  onSelectFormType: (type: FormType) => void;
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  selectedFormType,
  onSelectFormType,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        {t('dashboard.upload.selectType')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {documentTypes.map((docType) => {
          const isSelected = selectedFormType === docType.type;
          const iconBgClass = getColorClasses(docType.colorScheme, isSelected);
          const subtitleClass = getSubtitleColorClass(docType.colorScheme, isSelected);
          const checkmarkBg = getCheckmarkBgClass(docType.colorScheme);

          return (
            <button
              key={docType.type}
              onClick={() => onSelectFormType(docType.type)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${docType.selectedBg} shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconBgClass}`}>
                <svg
                  className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {docType.icon}
                </svg>
              </div>
              <h4 className={`font-semibold text-sm ${isSelected ? docType.selectedText : 'text-gray-900'}`}>
                {t(`dashboard.upload.${docType.type}.title`)}
              </h4>
              <p className={`text-xs mt-1 ${subtitleClass}`}>
                {t(`dashboard.upload.${docType.type}.subtitle`)}
              </p>
              {isSelected && (
                <div className={`absolute top-2 right-2 w-5 h-5 ${checkmarkBg} rounded-full flex items-center justify-center`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentTypeSelector;
