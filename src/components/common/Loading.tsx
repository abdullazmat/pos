"use client";

import React from "react";

export default function Loading({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Loading card */}
        <div className="relative flex flex-col items-center gap-6 px-8 py-10 rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 shadow-2xl backdrop-blur-sm">
          {/* Spinner with multiple rings */}
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-3 rounded-full bg-blue-500/20 animate-pulse"></div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
              <div className="absolute w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
          </div>
          
          {/* Label with animated dots */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-100">{label}</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
