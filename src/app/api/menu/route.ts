import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const menuItems = await db.menu_items.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const formattedMenuItems = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.category.id,
      categoryName: item.category.name,
      photoUrl: item.photoUrl,
    }));

    return NextResponse.json(formattedMenuItems);
  } catch (error) {
    console.error("Помилка отримання елементів меню:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати елементи меню" },
      { status: 500 }
    );
  }
}
