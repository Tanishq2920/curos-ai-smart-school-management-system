import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Calendar, FileText, Star, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const loadNotifications = () => {
    schoolService.fetchNotifications().then(setNotifications).catch(console.error);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = notifications.filter(n => filter === 'All' || n.isUnread);

  const handleMarkRead = async (id: string) => {
    await schoolService.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await schoolService.markAllNotificationsRead();
    loadNotifications();
  };

  const renderIcon = (type: NotificationItem['iconType']) => {
    switch (type) {
      case 'megaphone':
        return <Megaphone className="w-5 h-5" />;
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      case 'file-text':
        return <FileText className="w-5 h-5" />;
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'message-circle':
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notification Center</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Recipient-specific alerts, official circulars, attendance notifications, and meeting updates.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-blue-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            filter === 'All'
              ? 'bg-[#1769FF] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            filter === 'Unread'
              ? 'bg-[#1769FF] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
          }`}
        >
          Unread ({notifications.filter(n => n.isUnread).length})
        </button>
      </div>

      {/* Notification items */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs divide-y divide-gray-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-colors ${
                item.isUnread ? 'bg-blue-50/25' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg} ${item.iconColor}`}
                >
                  {renderIcon(item.iconType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                    {item.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#1769FF] inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                  <span className="text-[11px] text-gray-400 mt-2 block font-medium">
                    {item.timestamp}
                  </span>
                </div>
              </div>
              {item.isUnread && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
};
