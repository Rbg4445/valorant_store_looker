import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        <div className="h-8 w-48 bg-gray-800/80 rounded-lg animate-pulse" />
        <div className="h-8 w-32 bg-gray-800/80 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-[#0f1923]/80 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between h-[360px] animate-pulse relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-20 bg-gray-800 rounded-full" />
              <div className="h-4 w-14 bg-gray-800 rounded-full" />
            </div>

            <div className="my-auto flex justify-center items-center py-6">
              <div className="w-48 h-24 bg-gray-800/60 rounded-xl" />
            </div>

            <div className="pt-4 border-t border-gray-800/60 space-y-3">
              <div className="h-5 w-3/4 bg-gray-800 rounded-md" />
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-gray-800 rounded-md" />
                <div className="h-8 w-24 bg-gray-800 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
