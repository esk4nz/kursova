import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, city_name } = body;

    if (!id || !city_name) {
      return NextResponse.json(
        { error: "ID міста та назва є обов'язковими" },
        { status: 400 }
      );
    }

    const existingCity = await db.cities.findFirst({
      where: { city_name },
    });

    if (existingCity && existingCity.id !== id) {
      return NextResponse.json(
        { error: "Місто з такою назвою вже існує" },
        { status: 400 }
      );
    }

    const updatedCity = await db.cities.update({
      where: { id },
      data: { city_name },
    });

    return NextResponse.json(updatedCity);
  } catch (error) {
    console.error("Помилка оновлення міста:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити місто" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city_name } = body;
    console.log(body);
    if (!city_name) {
      return NextResponse.json(
        { error: "Назва міста є обов'язковою" },
        { status: 400 }
      );
    }

    const existingCity = await db.cities.findUnique({
      where: { city_name },
    });

    if (existingCity) {
      return NextResponse.json({ error: "Місто вже існує" }, { status: 400 });
    }

    const newCity = await db.cities.create({
      data: {
        city_name,
      },
    });

    return NextResponse.json(newCity);
  } catch (error) {
    console.error("Помилка створення міста:", error);
    return NextResponse.json(
      { error: "Не вдалося створити місто" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const cityId = parseInt(url.searchParams.get("cityId") || "", 10);

    if (!cityId) {
      return NextResponse.json(
        { error: "ID міста є обов'язковим" },
        { status: 400 }
      );
    }

    const city = await db.cities.findUnique({
      where: { id: cityId },
      include: { addresses: true },
    });

    if (!city) {
      return NextResponse.json({ error: "Місто не знайдено" }, { status: 404 });
    }

    if (city.addresses.length > 0) {
      return NextResponse.json(
        { error: "Не можна видалити місто, яке має пов'язані адреси" },
        { status: 400 }
      );
    }

    await db.cities.delete({
      where: { id: cityId },
    });

    return NextResponse.json({
      message: "Місто успішно видалено.",
    });
  } catch (error) {
    console.error("Помилка видалення міста:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити місто" },
      { status: 500 }
    );
  }
}
