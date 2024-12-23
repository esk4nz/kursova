import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="bg-gray-100 py-12 flex">
      {/* Бокова панель */}
      <div className="w-1/4 p-4 bg-white shadow-lg sticky top-0 h-screen flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Категорії</h2>
        <ul className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <li key={i}>
              <span className="block py-2 px-4 rounded-lg bg-gray-200 animate-pulse w-full"></span>
            </li>
          ))}
        </ul>
      </div>

      {/* меню */}
      <div className="w-3/4 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Меню</h1>
        {[...Array(3)].map((_, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 bg-gray-200 w-1/3 h-6 animate-pulse"></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-white shadow-lg rounded-lg p-4 animate-pulse"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
