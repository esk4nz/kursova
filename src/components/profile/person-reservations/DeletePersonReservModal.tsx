"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteReservationModal: React.FC<DeleteReservationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Підтвердження відміни
        </h2>
        <p className="text-gray-600 mb-4">
          Ви впевнені, що хочете відмінити цю резервацію?
        </p>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="confirmDelete" className="text-sm">
            Я підтверджую відміну резервації.
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="cancel">
            Скасувати
          </Button>
          <Button onClick={onConfirm} variant="delete" disabled={!isConfirmed}>
            Відміна
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReservationModal;
