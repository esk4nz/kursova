import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Назва категорії є обов'язковою" },
        { status: 400 }
      );
    }

    const existingCategory = await db.categories.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Категорія з такою назвою вже існує" },
        { status: 400 }
      );
    }

    const newCategory = await db.categories.create({
      data: { name },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("Помилка створення категорії:", error);
    return NextResponse.json(
      { error: "Не вдалося створити категорію" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID категорії та назва є обов'язковими" },
        { status: 400 }
      );
    }

    // Перевірка чи існує категорія з такою назвою
    const existingCategory = await db.categories.findFirst({
      where: { name },
    });

    if (existingCategory && existingCategory.id !== id) {
      return NextResponse.json(
        { error: "Категорія з такою назвою вже існує" },
        { status: 400 }
      );
    }

    const updatedCategory = await db.categories.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Помилка оновлення категорії:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити категорію" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = parseInt(url.searchParams.get("categoryId") || "", 10);

    if (!categoryId) {
      return NextResponse.json(
        { error: "ID категорії є обов'язковим" },
        { status: 401 }
      );
    }

    const menuItemExists = await db.menu_items.findFirst({
      where: { category_id: categoryId },
    });

    if (menuItemExists) {
      return NextResponse.json(
        {
          error:
            "Категорію неможливо видалити, оскільки вона містить прив'язані елементи меню.",
        },
        { status: 400 }
      );
    }

    const category = await db.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категорію не знайдено" },
        { status: 404 }
      );
    }

    await db.categories.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      message: "Категорію успішно видалено.",
    });
  } catch (error) {
    console.error("Помилка видалення категорії:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити категорію" },
      { status: 500 }
    );
  }
}
