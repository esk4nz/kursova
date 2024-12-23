"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteCommentModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteReviewModal: React.FC<DeleteCommentModalProps> = ({
  onClose,
  onConfirm,
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
        <h2 className="text-xl font-semibold mb-4">Видалення коментаря</h2>
        <p className="text-gray-600 mb-4">
          Ви впевнені, що хочете видалити цей коментар? Цю дію не можна
          скасувати.
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
            Я підтверджую видалення коментаря.
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="cancel" onClick={onClose}>
            Скасувати
          </Button>
          <Button
            variant="delete"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Видалити
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReviewModal;
