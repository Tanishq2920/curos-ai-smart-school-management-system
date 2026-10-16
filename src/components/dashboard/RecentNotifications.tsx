import React from 'react';
import { Megaphone, Calendar, FileText, Star, MessageCircle, ChevronRight } from 'lucide-react';
import { NotificationItem } from '../../types';

interface RecentNotificationsProps {
  notifications: NotificationItem[];
  onViewAll?: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const RecentNotifications: React.FC<RecentNotificationsProps> = ({
  notifications,
  onViewAll,
  onSelectNotification
}) => {
  const renderIcon = (type: NotificationItem['iconType']) => {
    switch (type) {
      case 'megaphone':
        return <Megaphone className="w-4 h-4 stroke-[2]" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 stroke-[2]" />;
      case 'file-text':
        return <FileText className="w-4 h-4 stroke-[2]" />;
      case 'star':
        return <Star className="w-4 h-4 stroke-[2]" />;
      case 'message-circle':
      default:
        return <MessageCircle className="w-4 h-4 stroke-[2]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F2F4F7]">
        <h2 className="text-[16px] font-bold text-[#101828] tracking-tight">
          Recent Notifications
        </h2>
        <button
          onClick={onViewAll}
          className="text-[13px] font-medium text-[#1769FF] hover:text-blue-700 hover:underline transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-[#F2F4F7] flex-1 flex flex-col justify-between">
        {notifications.slice(0, 5).map((notif) => (
          <div
            key={notif.id}
            onClick={() => onSelectNotification && onSelectNotification(notif)}
            className="py-3 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
          >
            {/* Left Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg} ${notif.iconColor}`}
            >
              {renderIcon(notif.iconType)}
            </div>

            {/* Middle Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[13.5px] font-bold text-[#101828] truncate group-hover:text-[#1769FF] transition-colors leading-tight">
                {notif.title}
              </h3>
              <p className="text-[11.5px] text-[#667085] truncate mt-0.5">
                {notif.description}
              </p>
            </div>

            {/* Right Status */}
            <div className="flex items-center gap-1.5 flex-shrink-0 text-[11.5px] text-[#98A2B3]">
              <span>{notif.timestamp}</span>
              {notif.isUnread ? (
                <span className="w-2 h-2 rounded-full bg-[#1769FF] inline-block" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3] group-hover:text-[#1769FF] group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
