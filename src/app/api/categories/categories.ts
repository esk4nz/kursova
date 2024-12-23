import { CategoryType } from "@/types/menu";

export async function getCategories(): Promise<CategoryType[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Не вдалося отримати категорії");
  }
  return response.json();
}

export async function createCategory(data: { name: string }): Promise<void> {
  const response = await fetch("/api/protected/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося створити категорію");
  }
}

export async function updateCategory(data: {
  id: number;
  name: string;
}): Promise<void> {
  const response = await fetch("/api/protected/categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося оновити категорію");
  }
}

export async function deleteCategory(categoryId: number): Promise<void> {
  const response = await fetch(
    `/api/protected/categories?categoryId=${categoryId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Не вдалося видалити категорію");
  }
}
