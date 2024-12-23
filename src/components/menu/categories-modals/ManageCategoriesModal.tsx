"use client";

import React, { useState } from "react";
import EditCategoryModal from "@/components/menu/categories-modals/EditCategoryModal";
import DeleteCategoryModal from "@/components/menu/categories-modals/DeleteCategoryModal";
import { CategoryType } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/app/api/categories/categories";

const ManageCategoriesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  onChange: () => void;
}> = ({ isOpen, onClose, categories, onChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory.id);

      toast({
        title: "Успіх",
        description: "Категорія успішно видалена.",
      });
      onChange();
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast({
          title: "Помилка",
          description:
            "Категорію неможливо видалити, оскільки до неї прив'язані пункти меню.",
        });
      } else {
        toast({
          title: "Помилка",
          description: `${String(error)}`,
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Редагувати категорії</h2>

        {/* Вибір категорії */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Виберіть категорію</label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedCategory?.id || ""}
            onChange={(e) => {
              const selected = categories.find(
                (category) => category.id === Number(e.target.value)
              );
              setSelectedCategory(selected || null);
            }}
          >
            <option value="">Оберіть категорію</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопки дій */}
        <div className="flex justify-between">
          <Button
            variant="submit"
            onClick={() => setIsManageModalOpen(true)}
            disabled={!selectedCategory}
          >
            Редагувати
          </Button>
          <Button
            variant="delete"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!selectedCategory}
          >
            Видалити
          </Button>
          <Button
            variant="add"
            onClick={() => {
              setSelectedCategory(null);
              setIsManageModalOpen(true);
            }}
          >
            Додати нову
          </Button>
        </div>

        {/* Кнопка Скасувати */}
        <div className="mt-4 flex justify-end">
          <Button variant="cancel" onClick={onClose}>
            Скасувати
          </Button>
        </div>

        {isManageModalOpen && (
          <EditCategoryModal
            isOpen={isManageModalOpen}
            onClose={() => setIsManageModalOpen(false)}
            onUpdate={() => {
              setIsManageModalOpen(false);
              onChange();
              setSelectedCategory(null);
            }}
            initialData={selectedCategory}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteCategoryModal
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={async () => {
              setIsDeleteModalOpen(false);
              await handleDeleteCategory();
            }}
            categoryName={selectedCategory?.name || ""}
          />
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
