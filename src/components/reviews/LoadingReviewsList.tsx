import React from "react";

const LoadingReviewsList: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="p-4 border rounded shadow animate-pulse space-y-2"
        >
          <div className="w-32 h-6 bg-gray-200"></div>
          <div className="flex space-x-2">
            {[...Array(5)].map((_, starIndex) => (
              <div
                key={starIndex}
                className="w-6 h-6 bg-gray-200 rounded-full"
              ></div>
            ))}
          </div>
          <div className="w-full h-4 bg-gray-200"></div>
          <div className="w-1/2 h-4 bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingReviewsList;
