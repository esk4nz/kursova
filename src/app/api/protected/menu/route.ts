import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, categoryId, photoUrl } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Назва, ціна та ID категорії є обов'язковими" },
        { status: 400 }
      );
    }

    const newMenuItem = await db.menu_items.create({
      data: {
        name,
        description,
        price,
        category_id: categoryId,
        photoUrl,
      },
    });

    return NextResponse.json(newMenuItem);
  } catch (error) {
    console.error("Помилка створення пункту меню:", error);
    return NextResponse.json(
      { error: "Не вдалося створити пункт меню" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const menuItemId = parseInt(url.searchParams.get("menuItemId") || "", 10);

    if (!menuItemId) {
      return NextResponse.json(
        { error: "ID пункту меню є обов'язковим" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, description, price, categoryId, photoUrl } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Назва, ціна та ID категорії є обов'язковими" },
        { status: 400 }
      );
    }

    const updatedMenuItem = await db.menu_items.update({
      where: { id: menuItemId },
      data: {
        name,
        description,
        price,
        category_id: categoryId,
        photoUrl,
      },
    });

    return NextResponse.json(updatedMenuItem);
  } catch (error) {
    console.error("Помилка оновлення пункту меню:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити пункт меню" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const menuItemId = parseInt(url.searchParams.get("menuItemId") || "", 10);

    if (!menuItemId) {
      return NextResponse.json(
        { error: "ID пункту меню є обов'язковим" },
        { status: 400 }
      );
    }

    const menuItem = await db.menu_items.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Пункт меню не знайдено" },
        { status: 404 }
      );
    }

    await db.menu_items.delete({
      where: { id: menuItemId },
    });

    return NextResponse.json({ message: "Пункт меню успішно видалено" });
  } catch (error) {
    console.error("Помилка видалення пункту меню:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити пункт меню" },
      { status: 500 }
    );
  }
}
