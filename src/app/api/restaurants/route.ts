import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const addressId = parseInt(url.searchParams.get("addressId") || "", 10);

    if (!addressId) {
      return NextResponse.json(
        { error: "ID адреси є обов'язковим" },
        { status: 400 }
      );
    }

    const existingRestaurant = await db.restaurants.findFirst({
      where: { id_address: addressId },
    });

    return NextResponse.json(existingRestaurant);
  } catch (error) {
    console.error("Помилка отримання ресторану:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати ресторан" },
      { status: 500 }
    );
  }
}
