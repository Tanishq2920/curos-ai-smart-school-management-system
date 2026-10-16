import React, { useState, useEffect } from 'react';
import { Star, Plus, Clock, MapPin, Users, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { SchoolEvent } from '../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  // New Event Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2025-09-20');
  const [time, setTime] = useState('10:00 AM – 03:00 PM');
  const [location, setLocation] = useState('School Auditorium');
  const [category, setCategory] = useState<'Academic' | 'Sports' | 'Cultural' | 'Career'>('Academic');
  const [description, setDescription] = useState('');

  const loadEvents = () => {
    schoolService.fetchEvents().then(setEvents).catch(console.error);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filtered = events.filter(e => categoryFilter === 'All' || e.category === categoryFilter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(dateObj.getDate()).padStart(2, '0');

    const badgeStyles = {
      Academic: { bg: 'bg-sky-50', text: 'text-sky-600' },
      Sports: { bg: 'bg-purple-50', text: 'text-purple-600' },
      Cultural: { bg: 'bg-rose-50', text: 'text-rose-500' },
      Career: { bg: 'bg-amber-50', text: 'text-amber-600' }
    };
    const style = badgeStyles[category];

    await schoolService.addEvent({
      month,
      day,
      dateStr: `${day} ${month} 2025`,
      title,
      time,
      location,
      badgeBg: style.bg,
      badgeText: style.text,
      category,
      description
    });
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    loadEvents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">School Events & Activities</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Official calendar for academic symposiums, sports tournaments, guidance sessions, and cultural galas.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Publish New Event</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Academic', 'Sports', 'Cultural', 'Career'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              categoryFilter === cat
                ? 'bg-[#1769FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
            }`}
          >
            {cat} Events
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex items-start gap-4"
          >
            {/* Left Date badge */}
            <div
              className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${item.badgeBg} ${item.badgeText}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">{item.month}</span>
              <span className="text-2xl font-bold leading-tight mt-0.5">{item.day}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                {item.category}
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-0.5 leading-snug">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.time}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.location}</span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{item.registeredCount} RSVPs</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Add School Event</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Career">Career</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Event agenda and participating grades..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
