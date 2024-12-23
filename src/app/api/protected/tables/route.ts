import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Запит на створення столика:", body);

    const { table_number, capacity, status, id_restaurant } = body;

    if (!table_number || !capacity || !id_restaurant) {
      return NextResponse.json(
        { error: "Відсутні або недійсні обов'язкові поля" },
        { status: 400 }
      );
    }

    const existingTable = await db.tables.findFirst({
      where: {
        table_number,
        id_restaurant,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Номер столика має бути унікальним у межах ресторану" },
        { status: 400 }
      );
    }

    const newTable = await db.tables.create({
      data: {
        table_number,
        capacity,
        status: status || "free",
        id_restaurant,
      },
    });

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error("Помилка створення столика:", error);
    return NextResponse.json(
      { error: "Не вдалося створити столик" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const id = parseInt(url.searchParams.get("id") || "", 10);
    const addressId = parseInt(url.searchParams.get("addressId") || "", 10);

    if (action === "update") {
      if (!id) {
        return NextResponse.json(
          { error: "ID столика є обов'язковим" },
          { status: 400 }
        );
      }

      const body = await req.json();
      console.log(body);
      const { table_number, capacity, status } = body;

      if (!table_number || !capacity || !status) {
        return NextResponse.json(
          { error: "Відсутні обов'язкові поля" },
          { status: 400 }
        );
      }

      console.log("Перевірка унікальності столика:", {
        table_number,
        id_restaurant: addressId,
        NOT: { id },
      });

      const existingTable = await db.tables.findFirst({
        where: {
          table_number,
          id_restaurant: addressId,
          NOT: { id },
        },
      });

      if (existingTable) {
        return NextResponse.json(
          { error: "Номер столика має бути унікальним у межах ресторану" },
          { status: 400 }
        );
      }

      const updatedTable = await db.tables.update({
        where: { id },
        data: {
          table_number,
          capacity,
          status,
        },
      });

      return NextResponse.json(updatedTable);
    } else if (action === "freeAll") {
      if (!addressId) {
        return NextResponse.json(
          { error: "ID адреси є обов'язковим" },
          { status: 400 }
        );
      }

      await db.tables.updateMany({
        where: { id_restaurant: addressId },
        data: { status: "free" },
      });

      const tables = await db.tables.findMany({
        where: { id_restaurant: addressId },
      });

      return NextResponse.json(tables);
    }

    return NextResponse.json({ error: "Невірна дія вказана" }, { status: 400 });
  } catch (error: any) {
    console.error("Помилка обробки PUT запиту:", error);
    return NextResponse.json(
      { error: error.message || "Не вдалося обробити PUT запит" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const tableId = parseInt(url.searchParams.get("id") || "", 10);

    if (!tableId) {
      return NextResponse.json(
        { error: "ID столика є обов'язковим" },
        { status: 400 }
      );
    }

    await db.tables.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Помилка видалення столика:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити столик" },
      { status: 500 }
    );
  }
}
