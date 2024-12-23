import { MenuItemType } from "@/types/menu";

export async function getMenuItems(): Promise<MenuItemType[]> {
  const response = await fetch("/api/menu");
  if (!response.ok) {
    throw new Error("Не вдалося отримати елементи меню");
  }
  return response.json();
}

export async function createMenuItem(data: any): Promise<void> {
  const response = await fetch("/api/protected/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося створити елемент меню");
  }
}

export async function updateMenuItem(
  menuItemId: number,
  data: any
): Promise<void> {
  const response = await fetch(`/api/protected/menu?menuItemId=${menuItemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося оновити елемент меню");
  }
}

export async function deleteMenuItem(menuItemId: number): Promise<void> {
  const response = await fetch(`/api/protected/menu?menuItemId=${menuItemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося видалити елемент меню");
  }
}
