import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Неавторизовано. Активна сесія відсутня." },
        { status: 401 }
      );
    }

    if (session.user.email !== email) {
      return NextResponse.json(
        { error: "Доступ заборонено. Email не відповідає користувачу сесії." },
        { status: 403 }
      );
    }

    if (email) {
      const reservations = await db.reservations.findMany({
        where: {
          email,
          status: "active",
        },
        select: {
          id: true,
          customer_name: true,
          customer_surname: true,
          customer_phone: true,
          start_time: true,
          date: true,
          end_time: true,
          people_count: true,
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

      const formattedReservations = reservations.map((reservation) => {
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
    }
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
    const body = await req.json();
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Неавторизовано. Активна сесія відсутня." },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    if (body.action === "updateEmail") {
      const { oldEmail, newEmail } = body;

      if (userEmail !== oldEmail) {
        return NextResponse.json(
          { error: "Доступ заборонено. Ви не можете змінювати цю резервацію." },
          { status: 403 }
        );
      }

      const updatedReservations = await db.reservations.updateMany({
        where: { email: oldEmail },
        data: { email: newEmail },
      });

      return NextResponse.json({
        message: "Email у резерваціях успішно оновлено",
        updatedReservations,
      });
    }

    // обробки (editReservation, cancelReservation)
    if (body.action === "editReservation") {
      const { id, customer_name, customer_surname, customer_phone } = body;

      const updatedReservation = await db.reservations.update({
        where: { id },
        data: {
          customer_name,
          customer_surname,
          customer_phone,
        },
      });

      return NextResponse.json({
        message: "Резервацію успішно оновлено",
        updatedReservation,
      });
    }

    if (body.action === "cancelReservation") {
      const updatedReservation = await db.reservations.update({
        where: { id: body.id },
        data: { status: "cancelled" },
      });

      return NextResponse.json({
        message: "Резервацію успішно скасовано",
        updatedReservation,
      });
    }

    return NextResponse.json({ error: "Невірні дані запиту" }, { status: 400 });
  } catch (error: any) {
    console.error("Помилка обробки PUT запиту:", error);
    return NextResponse.json(
      { error: "Не вдалося обробити PUT запит", details: error.message },
      { status: 500 }
    );
  }
}
