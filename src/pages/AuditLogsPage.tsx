import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, ShieldAlert } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = schoolService.getCurrentUser();

  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      schoolService.fetchAuditLogs().then(setLogs).catch(console.error);
    }
  }, [currentUser.role]);

  // Deny non-admin users
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-12 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            The security audit trail and institutional governance logs are restricted to school administrators. Ordinary roles do not have permission to inspect system audit records.
          </p>
        </div>
      </div>
    );
  }

  const filtered = logs.filter((l) =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.actor_name && l.actor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.details && l.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security & Governance Audit Trail</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Immutable system audit logging tracking authentication events, role checks, attendance entries, marks publication, and administrative decisions.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, action, details..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl outline-none"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Showing {filtered.length} logged events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{log.actor_name || 'System'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.actor_role || 'ANON'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{log.action}</td>
                    <td className="py-3 px-4 text-gray-600">{log.target_entity}</td>
                    <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    No audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
