import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, street_name, building_number, city_id } = body;

    if (!id || !street_name || !building_number || !city_id) {
      return NextResponse.json(
        { error: "Усі поля є обов'язковими" },
        { status: 400 }
      );
    }

    const existingAddress = await db.addresses.findFirst({
      where: {
        city_id,
        street_name,
        building_number,
      },
    });

    if (existingAddress && existingAddress.id !== id) {
      return NextResponse.json(
        { error: "Адреса не може повторюватися в межах одного міста!" },
        { status: 400 }
      );
    }

    const updatedAddress = await db.addresses.update({
      where: { id },
      data: { street_name, building_number },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Помилка оновлення адреси:", error);
    return NextResponse.json(
      { error: "Не вдалося оновити адресу" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { street_name, building_number } = body;
    const city_id = parseInt(body.city_id, 10);

    if (!city_id || !street_name || !building_number) {
      return NextResponse.json(
        { error: "ID міста, назва вулиці та номер будинку є обов'язковими" },
        { status: 400 }
      );
    }

    const existingAddress = await db.addresses.findFirst({
      where: {
        city_id,
        street_name,
        building_number,
      },
    });

    if (existingAddress) {
      return NextResponse.json({ error: "Адреса вже існує" }, { status: 400 });
    }

    const newAddress = await db.addresses.create({
      data: {
        city_id,
        street_name,
        building_number,
      },
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error("Помилка створення адреси:", error);
    return NextResponse.json(
      { error: "Не вдалося створити адресу" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const addressId = parseInt(url.searchParams.get("addressId") || "");

    if (!addressId) {
      return NextResponse.json(
        { error: "ID адреси є обов'язковим" },
        { status: 400 }
      );
    }

    await db.addresses.delete({
      where: { id: addressId },
    });

    return NextResponse.json({
      message: "Адресу успішно видалено.",
    });
  } catch (error: any) {
    console.error("Помилка видалення адреси:", error.message);
    return NextResponse.json(
      { error: "Не вдалося видалити адресу." },
      { status: 500 }
    );
  }
}
