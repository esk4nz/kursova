import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as z from "zod";

const reservationEditSchema = z.object({
  id: z.number(),
  customer_name: z
    .string()
    .min(2, "Ім'я обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  customer_surname: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/,
      "Прізвище може містити тільки літери"
    ),
  customer_phone: z
    .string()
    .regex(/^380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
});

const reservationEditSchema2 = z.object({
  id: z.number(),
  customer_name: z
    .string()
    .min(2, "Ім'я обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  customer_surname: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/,
      "Прізвище може містити тільки літери"
    ),
  customer_phone: z
    .string()
    .regex(/^380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
  email: z
    .string()
    .email("Невірний формат електронної пошти")
    .or(z.literal("").optional()),
  status: z.enum(["active", "completed", "cancelled"]),
});

export async function GET() {
  try {
    const allReservations = await db.reservations.findMany({
      select: {
        id: true,
        customer_name: true,
        customer_surname: true,
        customer_phone: true,
        email: true,
        start_time: true,
        date: true,
        end_time: true,
        people_count: true,
        status: true,
        tables: {
          select: {
            table_number: true,
            restaurants: {
              select: {
                address: {
                  select: {
                    street_name: true,
                    building_number: true,
                    cities: {
                      select: {
                        city_name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedReservations = allReservations.map((reservation) => {
      const { tables, ...rest } = reservation;
      const address = tables?.restaurants?.address;

      return {
        ...rest,
        table_number: tables?.table_number || -1,
        city: address ? address.cities.city_name : "Місто недоступне",
        address: address
          ? `${address.street_name} ${address.building_number}`
          : "Адреса недоступна",
      };
    });

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error("Помилка отримання резервацій:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати резервації" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const reservationId = url.searchParams.get("reservationId");
    const body = await req.json();

    if (reservationId && body.status) {
      const status = body.status;

      if (!["cancelled", "completed", "active"].includes(status)) {
        return NextResponse.json(
          { error: "Недійсне значення статусу" },
          { status: 400 }
        );
      }

      const updatedReservation = await db.reservations.update({
        where: { id: parseInt(reservationId, 10) },
        data: { status },
      });

      return NextResponse.json({
        message: `Статус резервації оновлено на ${status}`,
        updatedReservation,
      });
    }

    if (body.action === "cancelReservation" && body.id) {
      const { id } = body;

      const updatedReservation = await db.reservations.update({
        where: { id: parseInt(id, 10) },
        data: { status: "cancelled" },
      });

      return NextResponse.json({
        message: "Резервація успішно скасована",
        updatedReservation,
      });
    }

    if (body.action === "completeReservation" && body.id) {
      const { id } = body;

      const updatedReservation = await db.reservations.update({
        where: { id: parseInt(id, 10) },
        data: { status: "completed" },
      });

      return NextResponse.json({
        message: "Резервація успішно завершена",
        updatedReservation,
      });
    }

    if (body.action === "editReservation" && body.id) {
      const {
        id,
        customer_name,
        customer_surname,
        customer_phone,
        email,
        status,
      } = reservationEditSchema2.parse(body);

      const updatedReservation = await db.reservations.update({
        where: { id },
        data: {
          customer_name,
          customer_surname,
          customer_phone,
          email,
          status,
        },
      });

      return NextResponse.json({
        message: "Резервація успішно оновлена",
        updatedReservation,
      });
    }

    if (body.oldEmail && body.newEmail) {
      const { oldEmail, newEmail } = body;

      const updatedReservations = await db.reservations.updateMany({
        where: { email: oldEmail },
        data: { email: newEmail },
      });

      return NextResponse.json({
        message: "Електронну пошту успішно оновлено у резерваціях",
        updatedCount: updatedReservations.count,
      });
    }

    if (body.id) {
      const { id, customer_name, customer_surname, customer_phone } =
        reservationEditSchema.parse(body);

      const updatedReservation = await db.reservations.update({
        where: { id },
        data: {
          customer_name,
          customer_surname,
          customer_phone,
        },
      });

      console.log("Резервація успішно оновлена:", updatedReservation);

      return NextResponse.json({
        message: "Резервація успішно оновлена",
        updatedReservation,
      });
    }

    return NextResponse.json(
      { error: "Недійсні дані запиту" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Помилка обробки PUT запиту:", error);
    return NextResponse.json(
      { error: "Не вдалося обробити PUT запит", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log(url);
    if (!id) {
      return NextResponse.json(
        { error: "ID резервації є обов'язковим" },
        { status: 400 }
      );
    }

    // Видаляємо резервацію з бази даних
    const deletedReservation = await db.reservations.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({
      message: "Резервація успішно видалена",
      deletedReservation,
    });
  } catch (error) {
    console.error("Помилка видалення резервації:", error);
    return NextResponse.json(
      { error: "Не вдалося видалити резервацію" },
      { status: 500 }
    );
  }
}
