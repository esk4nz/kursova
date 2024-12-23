import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.categories.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Помилка отримання категорій:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати категорії" },
      { status: 500 }
    );
  }
}
