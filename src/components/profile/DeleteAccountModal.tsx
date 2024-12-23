"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteAccountModalProps = {
  onClose: () => void;
  onConfirm: (password: string) => void;
};

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (isConfirmed && password) {
      onConfirm(password);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Видалення аккаунту
        </h2>
        <p className="text-gray-600 mb-4">
          Для підтвердження видалення аккаунту, будь ласка, введіть ваш пароль і
          підтвердіть дію.
        </p>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Пароль
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Введіть ваш пароль"
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mr-2 focus:ring-blue-500"
          />
          <label htmlFor="confirmDelete" className="text-sm text-gray-700">
            Ви точно хочете видалити аккаунт?
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="cancel" onClick={onClose}>
            Скасувати
          </Button>
          <Button
            variant="delete"
            onClick={handleConfirm}
            disabled={!isConfirmed || !password}
          >
            Видалити
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
