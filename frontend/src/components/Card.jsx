import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Card = ({ title, description, Icon }) => {
  return (
    <div className="feature-card group relative p-8 h-full rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-white/5 overflow-hidden transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
      
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:via-emerald-500 transition-all duration-700"></div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500">
          <Icon className="w-7 h-7 text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" />
        </div>
        
        {/* Corner Arrow Icon */}
        <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-50 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Background Gradient Blob (Visible on Hover) */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    </div>
  );
};

export default Card;