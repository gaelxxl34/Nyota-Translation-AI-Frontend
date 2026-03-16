import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../AuthProvider';
import { scanOrphanData, deleteOrphanItem, bulkDeleteOrphans } from '../../services/adminService';
import type { OrphanItem, OrphanSummary } from '../../services/adminService';
import { getFormTypeLabel, formatDate } from './adminUtils';

const PAGE_SIZE = 10;

const TableSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-slate-700/50 px-6 py-3 flex gap-4">
      {[30, 140, 100, 120, 80, 60].map((w, i) => (
        <div key={i} className="h-3 bg-slate-600 rounded" style={{ width: w }} />
      ))}
    </div>
    {[...Array(PAGE_SIZE)].map((_, i) => (
      <div key={i} className="px-6 py-4 flex items-center gap-4 border-t border-slate-700">
        <div className="h-4 w-4 bg-slate-700 rounded" />
        <div className="h-4 bg-slate-700 rounded w-36" />
        <div className="h-4 bg-slate-700 rounded w-24" />
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="h-5 bg-slate-700 rounded-full w-16" />
        <div className="h-4 bg-slate-700 rounded w-12 ml-auto" />
      </div>
    ))}
  </div>
);

const OrphanDataPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orphans, setOrphans] = useState<OrphanItem[]>([]);
  const [summary, setSummary] = useState<OrphanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [collectionFilter, setCollectionFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrphans = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const data = await scanOrphanData(token);
      setOrphans(data.orphans);
      setSummary(data.summary);
      setCurrentPage(1);
      setSelected(new Set());
    } catch (err) {
      console.error('Failed to scan orphan data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchOrphans(); }, [fetchOrphans]);

  const handleDelete = async (item: OrphanItem) => {
    if (!currentUser || !confirm(`Permanently delete this ${item.collection} record for "${item.studentName}"? This cannot be undone.`)) return;
    try {
      setDeleting(`${item.collection}:${item.id}`);
      const token = await currentUser.getIdToken();
      await deleteOrphanItem(token, item.collection, item.id, item.type);
      setOrphans(prev => prev.filter(o => !(o.id === item.id && o.collection === item.collection && o.type === item.type)));
      setSelected(prev => { const next = new Set(prev); next.delete(`${item.collection}:${item.id}:${item.type}`); return next; });
    } catch (err) {
      console.error('Failed to delete orphan:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!currentUser || selected.size === 0) return;
    if (!confirm(`Permanently delete ${selected.size} selected orphan records? This cannot be undone.`)) return;
    try {
      setBulkDeleting(true);
      const token = await currentUser.getIdToken();
      const items = Array.from(selected).map(key => {
        const [collection, id] = key.split(':');
        return { collection, id };
      });
      await bulkDeleteOrphans(token, items);
      // Remove deleted items
      const deletedKeys = new Set(selected);
      setOrphans(prev => prev.filter(o => !deletedKeys.has(`${o.collection}:${o.id}:${o.type}`)));
      setSelected(new Set());
    } catch (err) {
      console.error('Failed to bulk delete:', err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (item: OrphanItem) => {
    const key = `${item.collection}:${item.id}:${item.type}`;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredOrphans = useMemo(() => {
    let result = orphans;
    if (typeFilter) result = result.filter(o => o.type === typeFilter);
    if (collectionFilter) result = result.filter(o => o.collection === collectionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.studentName?.toLowerCase().includes(q) ||
        o.userEmail?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orphans, typeFilter, collectionFilter, searchQuery]);

  const totalPages = Math.ceil(filteredOrphans.length / PAGE_SIZE);
  const paginatedOrphans = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrphans.slice(start, start + PAGE_SIZE);
  }, [filteredOrphans, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, typeFilter, collectionFilter]);

  const toggleSelectAll = () => {
    if (selected.size === paginatedOrphans.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedOrphans.map(o => `${o.collection}:${o.id}:${o.type}`)));
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'no_user':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">No User</span>;
      case 'inactive':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Inactive</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-slate-600 text-slate-300">{type}</span>;
    }
  };

  const getCollectionBadge = (collection: string) => {
    switch (collection) {
      case 'bulletins':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">Bulletins</span>;
      case 'certifiedDocuments':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">Certified</span>;
      case 'documents':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-slate-500/20 text-slate-400">Legacy</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-slate-600 text-slate-300">{collection}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{summary.total}</div>
            <div className="text-sm text-slate-400">Total Orphans</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-red-400">{summary.byType.no_user}</div>
            <div className="text-sm text-slate-400">No User</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-yellow-400">{summary.byType.inactive}</div>
            <div className="text-sm text-slate-400">Inactive</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{summary.byCollection.bulletins}</div>
            <div className="text-sm text-slate-400">Bulletins</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">{summary.byCollection.certifiedDocuments}</div>
            <div className="text-sm text-slate-400">Certified</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="no_user">No User</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Collection filter */}
          <select
            value={collectionFilter}
            onChange={e => setCollectionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Collections</option>
            <option value="bulletins">Bulletins</option>
            <option value="certifiedDocuments">Certified</option>
            <option value="documents">Legacy</option>
          </select>

          {/* Actions */}
          <button
            onClick={fetchOrphans}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-scan
          </button>

          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {bulkDeleting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete Selected ({selected.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : filteredOrphans.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-green-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium text-white">No orphan data found</p>
              <p className="text-sm mt-1">All records are properly associated with users.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-400 bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === paginatedOrphans.length && paginatedOrphans.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paginatedOrphans.map(item => {
                  const key = `${item.collection}:${item.id}:${item.type}`;
                  const isDeleting = deleting === `${item.collection}:${item.id}`;
                  return (
                    <tr key={key} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(key)}
                          onChange={() => toggleSelect(item)}
                          className="rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{item.studentName}</div>
                        {item.userEmail && <div className="text-xs text-slate-400">{item.userEmail}</div>}
                        <div className="text-xs text-slate-500 font-mono">{item.id.slice(0, 12)}...</div>
                      </td>
                      <td className="px-4 py-3">{getTypeBadge(item.type)}</td>
                      <td className="px-4 py-3">{getCollectionBadge(item.collection)}</td>
                      <td className="px-4 py-3 text-slate-300">{getFormTypeLabel(item.formType)}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{item.reason}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <span className="text-sm text-slate-400">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrphans.length)} of {filteredOrphans.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-500 px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 text-sm rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrphanDataPage;
