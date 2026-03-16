import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../AuthProvider';
import type { AdminDocument } from '../../services/adminService';
import { getDocuments, deleteDocument } from '../../services/adminService';
import { getFormTypeLabel, formatDate } from './adminUtils';

const PAGE_SIZE = 10;

const TableSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-slate-700/50 px-6 py-3 flex gap-4">
      {[140, 100, 120, 80, 90, 60].map((w, i) => (
        <div key={i} className="h-3 bg-slate-600 rounded" style={{ width: w }} />
      ))}
    </div>
    {[...Array(PAGE_SIZE)].map((_, i) => (
      <div key={i} className="px-6 py-4 flex items-center gap-4 border-t border-slate-700">
        <div className="h-4 bg-slate-700 rounded w-36" />
        <div className="h-4 bg-slate-700 rounded w-24" />
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="h-5 bg-slate-700 rounded-full w-16" />
        <div className="h-4 bg-slate-700 rounded w-24" />
        <div className="h-4 bg-slate-700 rounded w-12 ml-auto" />
      </div>
    ))}
  </div>
);

const DocumentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocs = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const data = await getDocuments(token, { formType: typeFilter || undefined, limit: 200 });
      setDocs(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, typeFilter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleDelete = async (docId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this document?')) return;
    try {
      setDeleting(docId);
      const token = await currentUser.getIdToken();
      await deleteDocument(token, docId);
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeleting(null);
    }
  };

  // Filter by search
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    const q = searchQuery.toLowerCase();
    return docs.filter(d =>
      d.studentName?.toLowerCase().includes(q) ||
      d.userEmail?.toLowerCase().includes(q) ||
      getFormTypeLabel(d.formType).toLowerCase().includes(q)
    );
  }, [docs, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE);
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDocs.slice(start, start + PAGE_SIZE);
  }, [filteredDocs, currentPage]);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Document Types</option>
            <option value="generalDocument">General Document</option>
            <option value="form4">Form 4</option>
            <option value="form6">Form 6</option>
            <option value="collegeTranscript">College Transcript</option>
            <option value="collegeAttestation">College Attestation</option>
            <option value="stateDiploma">State Diploma</option>
            <option value="bachelorDiploma">Bachelor Diploma</option>
            <option value="highSchoolAttestation">High School Attestation</option>
            <option value="stateExamAttestation">State Exam Attestation</option>
          </select>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by student, email, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
        <span className="text-sm text-slate-400">
          {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
          {searchQuery && filteredDocs.length !== docs.length && ` (of ${docs.length})`}
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No documents found</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{getFormTypeLabel(doc.formType)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{doc.userEmail || doc.userId?.slice(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === 'certified' ? 'bg-green-500/10 text-green-400' :
                          doc.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {doc.status || 'processed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{doc.uploadedAt ? formatDate(doc.uploadedAt) : '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleting === doc.id}
                          className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50 transition-colors"
                        >
                          {deleting === doc.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredDocs.length)} of {filteredDocs.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {pageNumbers.map((page, i) =>
                    page === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
