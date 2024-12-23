import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reservationSchema } from "@/types/reservations";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");
    const date = url.searchParams.get("date");

    if (!restaurantId || !date) {
      return NextResponse.json(
        { error: "ID ресторану та дата є обов'язковими" },
        { status: 400 }
      );
    }

    const reservations = await db.reservations.findMany({
      where: {
        tables: {
          restaurants: {
            id: parseInt(restaurantId, 10),
          },
        },
        date,
        status: "active",
      },
      select: {
        id: true,
        table_id: true,
        date: true,
        start_time: true,
        end_time: true,
        status: true,
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Помилка отримання резервацій:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати резервації" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const normalizedData = {
      ...body,
      email: body.email || null,
      user_id: body.user_id ? parseInt(body.user_id, 10) : null,
      date: body.date || "",
      start_time: body.start_time || "",
      end_time: body.end_time || "",
    };

    const data = reservationSchema.parse(normalizedData);

    const existingReservations = await db.reservations.findMany({
      where: {
        table_id: data.table_id,
        date: data.date,
        status: "active",
      },
      select: {
        start_time: true,
        end_time: true,
      },
    });

    const isTimeConflict = existingReservations.some((reservation) => {
      const resStart = reservation.start_time;
      const resEnd = reservation.end_time;
      return (
        (data.start_time >= resStart && data.start_time < resEnd) ||
        (data.end_time > resStart && data.end_time <= resEnd) ||
        (data.start_time <= resStart && data.end_time >= resEnd)
      );
    });
    if (isTimeConflict) {
      return NextResponse.json(
        { error: "Цей столик вже зарезервовано на вибраний часовий слот." },
        { status: 400 }
      );
    }

    const reservation = await db.reservations.create({
      data: {
        table_id: data.table_id,
        customer_name: data.customer_name,
        customer_surname: data.customer_surname,
        customer_phone: data.customer_phone,
        email: data.email || null,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        user_id: data.user_id || null,
        people_count: data.people_count,
        status: "active",
        created_by: "user",
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Помилка створення резервації:", error);
    return NextResponse.json(
      { error: "Не вдалося створити резервацію" },
      { status: 500 }
    );
  }
}
