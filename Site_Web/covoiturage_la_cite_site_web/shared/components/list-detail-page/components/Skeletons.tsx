"use client";

import React from "react";

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-3 border border-gray-100 flex gap-3 items-center shrink-0">
    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-3 bg-gray-200 animate-pulse rounded" style={{ width: "65%" }} />
      <div className="h-2.5 bg-gray-200 animate-pulse rounded" style={{ width: "48%" }} />
      <div className="h-2.5 bg-gray-200 animate-pulse rounded mt-1" style={{ width: "36%" }} />
    </div>
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 animate-pulse rounded" style={{ width: "55%" }} />
        <div className="h-3 bg-gray-200 animate-pulse rounded" style={{ width: "38%" }} />
      </div>
    </div>
    <div className="p-4 flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
          <div className="h-2.5 bg-gray-200 animate-pulse rounded" style={{ width: "45%" }} />
          <div className="h-3 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 bg-gray-200 animate-pulse rounded" style={{ width: "75%" }} />
        </div>
      ))}
    </div>
  </div>
);
