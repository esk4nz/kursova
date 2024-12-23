import React from "react";

const LoadingTimeSlots: React.FC = () => {
  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        Завантаження таймслотів...
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-2 bg-gray-200 rounded-md animate-pulse h-8"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingTimeSlots;
