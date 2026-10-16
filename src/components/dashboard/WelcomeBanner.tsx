import React from 'react';
import { SchoolIllustration } from './SchoolIllustration';
import { Bot, Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  userName?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ userName = 'Admin User' }) => {
  return (
    <div className="relative overflow-hidden bg-[#EBF3FE] border border-[#D8E6FC] rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-center justify-between min-h-[178px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left text section */}
      <div className="z-10 max-w-xl">
        <span className="text-[#475467] text-[15px] font-medium block">
          Welcome back,
        </span>
        <h1 className="text-[#101828] text-2xl md:text-[28px] font-bold tracking-tight mt-1 mb-2 flex items-center gap-2">
          <span>{userName}</span>
          <span className="inline-block hover:rotate-12 transition-transform cursor-default select-none">
            👋
          </span>
        </h1>
        <p className="text-[#475467] text-[13.5px] leading-relaxed max-w-[430px]">
          Manage your school's academic and administrative activities from a single integrated platform.
        </p>
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event('open-curos-ai'))}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Bot className="w-4 h-4 text-indigo-100" />
            <span>Ask CUROS AI</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </button>
        </div>
      </div>

      {/* Right school building illustration */}
      <div className="mt-4 md:mt-0 flex-shrink-0 self-end md:self-center">
        <SchoolIllustration className="w-64 h-36 md:w-72 md:h-40 lg:w-80 lg:h-44" />
      </div>
    </div>
  );
};
