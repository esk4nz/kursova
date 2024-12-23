import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format, parse } from "date-fns";

export async function PUT() {
  try {
    const now = new Date();

    const currentDate = format(now, "dd.MM.yyyy");
    const currentTime = format(now, "HH:mm");

    const freeTables = await db.tables.findMany({
      where: {
        status: {
          in: ["free", "occupied"],
        },
      },
    });

    for (const table of freeTables) {
      const activeReservations = await db.reservations.findMany({
        where: {
          table_id: table.id,
          date: currentDate,
          status: "active",
        },
        select: {
          start_time: true,
          end_time: true,
        },
      });

      const isReserved = activeReservations.some((reservation) => {
        const resStart = parse(reservation.start_time, "HH:mm", new Date());
        const resEnd = parse(reservation.end_time, "HH:mm", new Date());
        const current = parse(currentTime, "HH:mm", new Date());

        return current >= resStart && current <= resEnd;
      });

      if (isReserved) {
        await db.tables.update({
          where: { id: table.id },
          data: { status: "reserved" },
        });
      }
    }

    const reservedTables = await db.tables.findMany({
      where: { status: "reserved" },
    });

    for (const table of reservedTables) {
      const activeReservations = await db.reservations.findMany({
        where: {
          table_id: table.id,
          date: currentDate,
          status: "active",
        },
        select: {
          start_time: true,
          end_time: true,
        },
      });

      const isStillReserved = activeReservations.some((reservation) => {
        const resEnd = parse(reservation.end_time, "HH:mm", new Date());
        const current = parse(currentTime, "HH:mm", new Date());

        return current <= resEnd;
      });

      if (!isStillReserved) {
        await db.tables.update({
          where: { id: table.id },
          data: { status: "free" },
        });
      }
    }

    return NextResponse.json(
      { message: "Статуси столиків оновлено" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Помилка сервера:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
