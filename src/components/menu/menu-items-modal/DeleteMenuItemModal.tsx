"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteMenuItemModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  menuItemName: string;
  categoryName: string;
};

const DeleteMenuItemModal: React.FC<DeleteMenuItemModalProps> = ({
  onClose,
  onConfirm,
  menuItemName,
  categoryName,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Видалення пункту меню</h2>
        <p className="text-gray-600 mb-4">
          Ви впевнені, що хочете видалити <b>"{menuItemName}"</b> з категорії "
          <b>{categoryName}</b>"? Цю дію не можна скасувати.
        </p>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mr-2 focus:ring-blue-500"
          />
          <label htmlFor="confirmDelete" className="text-sm text-gray-700">
            Я підтверджую видалення пункту меню.
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="cancel">
            Скасувати
          </Button>
          <Button
            onClick={handleConfirm}
            variant="delete"
            disabled={!isConfirmed}
          >
            Видалити
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMenuItemModal;
