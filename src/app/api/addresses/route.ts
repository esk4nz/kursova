import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cityId = parseInt(url.searchParams.get("cityId") || "");

    if (!cityId) {
      return NextResponse.json(
        { error: "ID міста є обов'язковим" },
        { status: 400 }
      );
    }

    const addresses = await db.addresses.findMany({
      where: { city_id: cityId },
      select: {
        id: true,
        street_name: true,
        building_number: true,
        restaurants: {
          select: {
            id: true,
          },
        },
      },
    });

    const result = addresses.map((address) => ({
      id: address.id,
      street_name: address.street_name,
      building_number: address.building_number,
      restaurant_id: address.restaurants?.id || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Помилка отримання адрес:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати адреси" },
      { status: 500 }
    );
  }
}
