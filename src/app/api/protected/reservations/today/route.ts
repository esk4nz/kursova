import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format } from "date-fns";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const addressId = url.searchParams.get("addressId");

    if (!addressId) {
      return NextResponse.json(
        { error: "ID адреси є обов'язковим" },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentDate = format(now, "dd.MM.yyyy");

    const reservations = await db.reservations.findMany({
      where: {
        date: currentDate,
        status: "active",
        tables: {
          restaurants: {
            address: {
              id: parseInt(addressId, 10),
            },
          },
        },
      },
      select: {
        id: true,
        customer_name: true,
        customer_surname: true,
        customer_phone: true,
        email: true,
        start_time: true,
        end_time: true,
        people_count: true,
        status: true,
        tables: {
          select: {
            id: true,
            table_number: true,
          },
        },
      },
    });
    //console.log("Резервації:", reservations);

    if (reservations.length === 0) {
      return NextResponse.json(
        { message: "На сьогодні резервації не знайдено" },
        { status: 404 }
      );
    }

    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      table_id: reservation.tables.id,
      table_number: reservation.tables.table_number,
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error("Помилка отримання резервацій на сьогодні:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати резервації на сьогодні" },
      { status: 500 }
    );
  }
}
