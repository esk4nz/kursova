import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);
    const { id_address } = body;

    if (!id_address) {
      return NextResponse.json(
        { error: "ID адреси є обов'язковим" },
        { status: 400 }
      );
    }

    const existingRestaurant = await db.restaurants.findFirst({
      where: { id_address },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Ресторан вже існує за цією адресою" },
        { status: 400 }
      );
    }

    const newRestaurant = await db.restaurants.create({
      data: {
        id_address,
      },
    });

    return NextResponse.json(newRestaurant);
  } catch (error) {
    console.error("Помилка створення ресторану:", error);
    return NextResponse.json(
      { error: "Не вдалося створити ресторан" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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
    const restaurant = await db.restaurants.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Ресторан не знайдено" },
        { status: 404 }
      );
    }

    await db.restaurants.delete({
      where: { id: restaurantId },
    });

    return NextResponse.json({
      message: `Ресторан з ID ${restaurantId} успішно видалено.`,
    });
  } catch (error) {
    console.error("Помилка видалення ресторану:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити ресторан" },
      { status: 500 }
    );
  }
}
