// Student Documents Component for Partner Dashboard
// Displays list of documents from partner's students

import React from 'react';
import type { PartnerDocument, PartnerDocumentDetail } from '../../hooks/usePartner';

interface StudentDocumentsProps {
  documents: PartnerDocument[];
  selectedDocument: PartnerDocumentDetail | null;
  loading: boolean;
  statusFilter: string;
  formTypeFilter: string;
  searchQuery: string;
  onStatusFilterChange: (status: string) => void;
  onFormTypeFilterChange: (formType: string) => void;
  onSearchChange: (query: string) => void;
  onDocumentSelect: (docId: string) => void;
  onBackToList: () => void;
}

const statusColors: Record<string, string> = {
  pending_review: 'bg-yellow-500/20 text-yellow-400',
  in_review: 'bg-blue-500/20 text-blue-400',
  ai_completed: 'bg-purple-500/20 text-purple-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  pending_review: 'Pending Review',
  in_review: 'In Review',
  ai_completed: 'AI Completed',
  approved: 'Approved',
  rejected: 'Rejected',
};

const formTypeLabels: Record<string, string> = {
  bulletin: 'School Bulletin',
  state_diploma: 'State Diploma',
  bachelor_diploma: 'Bachelor Diploma',
  college_transcript: 'College Transcript',
  attestation: 'Attestation',
  high_school_attestation: 'High School Attestation',
  college_attestation: 'College Attestation',
  state_exam_attestation: 'State Exam Attestation',
};

const StudentDocuments: React.FC<StudentDocumentsProps> = ({
  documents,
  selectedDocument,
  loading,
  statusFilter,
  formTypeFilter,
  searchQuery,
  onStatusFilterChange,
  onFormTypeFilterChange,
  onSearchChange,
  onDocumentSelect,
  onBackToList,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Document Detail View
  if (selectedDocument) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={onBackToList}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documents
        </button>

        {/* Document Header */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {selectedDocument.studentName || 'Unknown Student'}
              </h3>
              <p className="text-gray-400 text-sm">
                {formTypeLabels[selectedDocument.formType] || selectedDocument.formType}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium self-start ${statusColors[selectedDocument.status]}`}>
              {statusLabels[selectedDocument.status] || selectedDocument.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div>
              <p className="text-gray-400">Document ID</p>
              <p className="text-white font-mono">{selectedDocument.id.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="text-gray-400">School</p>
              <p className="text-white">{selectedDocument.schoolName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Class</p>
              <p className="text-white">{selectedDocument.className || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Academic Year</p>
              <p className="text-white">{selectedDocument.academicYear || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Submitted</p>
              <p className="text-white">{formatDate(selectedDocument.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-400">Approved</p>
              <p className="text-white">{formatDate(selectedDocument.approvedAt)}</p>
            </div>
            <div>
              <p className="text-gray-400">Approved By</p>
              <p className="text-white">{selectedDocument.approvedByName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">User Email</p>
              <p className="text-white truncate">{selectedDocument.userEmail}</p>
            </div>
          </div>
        </div>

        {/* Translated Data */}
        {selectedDocument.translatedData && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Translated Data</h4>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              {JSON.stringify(selectedDocument.translatedData, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {selectedDocument.pdfUrl && (
            <a
              href={selectedDocument.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </a>
          )}
          {selectedDocument.originalFileUrl && (
            <a
              href={selectedDocument.originalFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Original
            </a>
          )}
        </div>
      </div>
    );
  }

  // Documents List View
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex gap-3 sm:gap-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="flex-1 sm:flex-none bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="in_review">In Review</option>
            <option value="ai_completed">AI Completed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Form Type Filter */}
          <select
            value={formTypeFilter}
            onChange={(e) => onFormTypeFilterChange(e.target.value)}
            className="flex-1 sm:flex-none bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="bulletin">School Bulletin</option>
            <option value="state_diploma">State Diploma</option>
            <option value="bachelor_diploma">Bachelor Diploma</option>
            <option value="college_transcript">College Transcript</option>
            <option value="attestation">Attestation</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400">No documents found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery || statusFilter || formTypeFilter
                ? 'Try adjusting your filters'
                : 'Documents will appear here when students submit them'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-700">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => onDocumentSelect(doc.id)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{doc.studentName || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs truncate">{doc.userEmail}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${statusColors[doc.status]}`}>
                      {statusLabels[doc.status] || doc.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{formTypeLabels[doc.formType] || doc.formType}</span>
                    <span className="text-gray-500">{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                    Document Type
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => onDocumentSelect(doc.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{doc.studentName || 'Unknown'}</p>
                        <p className="text-gray-400 text-sm">{doc.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{formTypeLabels[doc.formType] || doc.formType}</p>
                      {doc.schoolName && (
                        <p className="text-gray-500 text-sm">{doc.schoolName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[doc.status]}`}>
                        {statusLabels[doc.status] || doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(doc.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentSelect(doc.id);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDocuments;
