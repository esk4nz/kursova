"use client";

import Link from "next/link";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">Помилка 404</h1>
      <h2 className="text-3xl font-semibold mb-2">Сторінку не знайдено</h2>
      <p className="text-gray-600 mb-6">
        Неправильно набрано адресу або такої сторінки на сайті більше не існує.
      </p>
      <Link
        href="/"
        className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-300"
      >
        Перейти на головну сторінку
      </Link>
    </div>
  );
}

export default NotFoundPage;
