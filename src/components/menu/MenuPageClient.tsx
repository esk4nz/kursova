"use client";

import React, { useEffect, useState } from "react";
import MenuItem from "@/components/menu/MenuItem";
import Loading from "@/components/menu/LoadingMenu";
import { MenuItemType, CategoryType } from "@/types/menu";
import { getCategories } from "@/app/api/categories/categories";
import { getMenuItems } from "@/app/api/menu/menu";
import ManageCategoriesModal from "@/components/menu/categories-modals/ManageCategoriesModal";
import ManageMenuItemsModal from "@/components/menu/menu-items-modal/ManageMenuItemsModal";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

function MenuPageClient() {
  const [groupedMenuItems, setGroupedMenuItems] = useState<{
    [category: string]: MenuItemType[];
  }>({});
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isEditCategoriesModalOpen, setIsEditCategoriesModalOpen] =
    useState(false);
  const [isEditMenuItemsModalOpen, setIsEditMenuItemsModalOpen] =
    useState(false);

  const menuItems = Object.values(groupedMenuItems).flat();
  const { data: session } = useSession();

  const isManagerOrAdmin =
    session?.user.userRole === "Manager" || session?.user.userRole === "Admin";

  const fetchMenuItems = async () => {
    try {
      const data = await getMenuItems();

      const groupedItems = data.reduce((acc, item) => {
        const category = item.categoryName || "Інше";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as { [category: string]: MenuItemType[] });

      // Сортування за алфавітом
      const sortedGroupedItems = Object.keys(groupedItems)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .reduce((acc, key) => {
          acc[key] = groupedItems[key];
          return acc;
        }, {} as { [category: string]: MenuItemType[] });

      setGroupedMenuItems(sortedGroupedItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();

      const sortedCategories = data.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  if (Object.keys(groupedMenuItems).length === 0) {
    return <Loading />;
  }

  return (
    <div className="py-12 flex">
      {/* Бокова панель */}
      <div className="sticky top-0 h-fit p-4 bg-white shadow-lg">
        {isManagerOrAdmin && (
          <>
            <Button
              variant="submit"
              onClick={() => setIsEditMenuItemsModalOpen(true)}
              className="w-full mb-3"
            >
              Редагувати меню
            </Button>
            <Button
              variant="submit"
              onClick={() => setIsEditCategoriesModalOpen(true)}
              className="w-full mb-3"
            >
              Редагувати категорії
            </Button>
          </>
        )}

        <h2 className="text-2xl font-bold mb-4">Категорії</h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`#${category.name}`}
                className="block py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Основний вміст меню */}
      <div className="w-3/4 container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Меню</h1>
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category} id={category} className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description || "Опис відсутній"}
                  price={item.price}
                  image={item.photoUrl || "/highlight-1.jpg"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальні вікна */}
      {isEditCategoriesModalOpen && (
        <ManageCategoriesModal
          isOpen={isEditCategoriesModalOpen}
          onClose={() => setIsEditCategoriesModalOpen(false)}
          categories={categories}
          onChange={() => {
            fetchCategories();
            fetchMenuItems();
          }}
        />
      )}
      {isEditMenuItemsModalOpen && (
        <ManageMenuItemsModal
          isOpen={isEditMenuItemsModalOpen}
          onClose={() => setIsEditMenuItemsModalOpen(false)}
          menuItems={menuItems}
          categories={categories}
          onChange={() => {
            fetchMenuItems();
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}
export default MenuPageClient;
