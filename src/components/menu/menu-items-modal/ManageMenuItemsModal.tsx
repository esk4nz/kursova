"use client";

import React, { useState, useEffect } from "react";
import EditMenuItemModal from "./EditMenuItemModal";
import DeleteMenuItemModal from "./DeleteMenuItemModal";
import { MenuItemType, CategoryType } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { deleteMenuItem } from "@/app/api/menu/menu";
import { deletePhoto } from "@/app/api/protected/photos/photos";

type ManageMenuItemsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItemType[];
  categories: CategoryType[];
  onChange: () => void;
};

const ManageMenuItemsModal: React.FC<ManageMenuItemsModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  categories,
  onChange,
}) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType | null>(
    null
  );
  const [filteredMenuItems, setFilteredMenuItems] =
    useState<MenuItemType[]>(menuItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCategoryId !== null) {
      const filteredItems = menuItems.filter(
        (item) => item.categoryId === selectedCategoryId
      );
      setFilteredMenuItems(filteredItems);
    } else {
      setFilteredMenuItems(menuItems);
    }
  }, [selectedCategoryId, menuItems]);

  const handleDeleteMenuItem = async () => {
    if (!selectedMenuItem) return;

    try {
      if (selectedMenuItem.photoUrl) {
        await deletePhoto(selectedMenuItem.photoUrl);
      }

      await deleteMenuItem(selectedMenuItem.id);

      setSelectedMenuItem(null);
      toast({
        title: "Успіх",
        description: "Пункт меню успішно видалено.",
      });

      onChange();
    } catch (error) {
      toast({
        title: "Помилка",
        description: `${String(error)}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Управління меню</h2>

        {/* Вибір категорії */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Фільтрувати за категорією
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedCategoryId || ""}
            onChange={(e) => {
              const categoryId = e.target.value ? Number(e.target.value) : null;
              setSelectedCategoryId(categoryId);
              setSelectedMenuItem(null);
            }}
          >
            <option value="">Усі категорії</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Вибір пункту меню */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Виберіть пункт меню
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedMenuItem?.id || ""}
            onChange={(e) => {
              const selected = filteredMenuItems.find(
                (menuItem) => menuItem.id === Number(e.target.value)
              );
              setSelectedMenuItem(selected || null);
            }}
          >
            <option value="">Оберіть пункт меню</option>
            {filteredMenuItems.map((menuItem) => (
              <option key={menuItem.id} value={menuItem.id}>
                {menuItem.name}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопки дій */}
        <div className="flex justify-between">
          <Button
            variant="submit"
            onClick={() => setIsEditModalOpen(true)}
            disabled={!selectedMenuItem}
          >
            Редагувати
          </Button>
          <Button
            variant="delete"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!selectedMenuItem}
          >
            Видалити
          </Button>
          <Button
            variant="add"
            onClick={() => {
              setSelectedMenuItem(null);
              setIsEditModalOpen(true);
            }}
          >
            Додати новий
          </Button>
        </div>

        {/* Кнопка Скасувати */}
        <div className="mt-4 flex justify-end">
          <Button variant="cancel" onClick={onClose}>
            Скасувати
          </Button>
        </div>

        {/* Модальні вікна */}
        {isEditModalOpen && (
          <EditMenuItemModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={() => {
              setIsEditModalOpen(false);
              setSelectedMenuItem(null);
              onChange();
            }}
            initialData={selectedMenuItem}
            categories={categories}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteMenuItemModal
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={async () => {
              setIsDeleteModalOpen(false);
              await handleDeleteMenuItem();
            }}
            menuItemName={selectedMenuItem?.name || ""}
            categoryName={
              categories.find(
                (category) => category.id === selectedMenuItem?.categoryId
              )?.name || ""
            }
          />
        )}
      </div>
    </div>
  );
};

export default ManageMenuItemsModal;
