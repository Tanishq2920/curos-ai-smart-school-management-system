import React, { useState } from 'react';
import { Files, Download, Search, Check } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { PYQItem } from '../types';

export const PYQsPage: React.FC = () => {
  const [pyqs] = useState<PYQItem[]>(schoolService.getPYQs());
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const filtered = pyqs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'All' || p.classGrade === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleDownload = (id: string, title: string) => {
    setDownloadedId(id);
    setTimeout(() => {
      setDownloadedId(null);
      alert(`Downloaded ${title} (PDF) successfully.`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Files className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PYQ Library (Previous Year Questions)</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Curated archive of board exam question papers, marking schemes, and sample practice papers.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search papers by subject, topic..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 w-full sm:w-auto">
          <span>Grade:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none"
          >
            <option value="All">All Grades</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 12">Class 12</option>
          </select>
        </div>
      </div>

      {/* Grid of PYQ Papers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Files className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {item.board} • {item.year}
                </span>
                <h3 className="font-bold text-gray-900 text-sm mt-1">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.classGrade} • {item.fileSize} • {item.downloads.toLocaleString()} downloads
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(item.id, item.title)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-[#1769FF] text-gray-700 hover:text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
            >
              {downloadedId === item.id ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
