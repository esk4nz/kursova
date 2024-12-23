import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const restaurantId = parseInt(
      url.searchParams.get("restaurantId") || "",
      10
    );

    if (!restaurantId) {
      return NextResponse.json(
        { error: "ID ресторану є обов'язковим" },
        { status: 400 }
      );
    }

    const tables = await db.tables.findMany({
      where: { id_restaurant: restaurantId },
      select: { id: true, table_number: true, capacity: true, status: true },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Помилка отримання столиків:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати столики" },
      { status: 500 }
    );
  }
}
