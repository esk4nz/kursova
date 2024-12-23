import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cities = await db.cities.findMany({
      select: {
        id: true,
        city_name: true,
      },
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Помилка отримання міст:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати міста" },
      { status: 500 }
    );
  }
}
