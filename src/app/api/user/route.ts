import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const passwordChangeSchema = z.object({
  id: z.number(),
  oldPassword: z.string().min(1, "Старий пароль обов'язковий"),
  newPassword: z.string().min(8, "Новий пароль має бути мінімум 8 символів"),
});
const profileChangeSchema = z.object({
  id: z.number(),
  firstName: z
    .string()
    .min(2, "Ім'я обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  lastName: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  email: z
    .string()
    .min(1, "Електронна пошта обов'язкова")
    .email("Неправильний формат електронної пошти"),
  phoneNumber: z
    .string()
    .regex(/^380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
});

const userSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ім'я обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  lastName: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  phoneNumber: z
    .string()
    .regex(/^380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
  email: z
    .string()
    .min(1, "Електронна пошта обов'язкова")
    .email("Неправильно електронна пошта"),
  password: z
    .string()
    .min(1, "Пароль обов'язковий")
    .min(8, "Пароль має бути мінімум 8 символів"),
});

export async function GET() {
  try {
    const users = await db.users.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        user_role: true,
      },
    });

    // Форматуємо дані під типи
    const formattedUsers = users.map((user) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      userRole: user.user_role,
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error("Помилка отримання користувачів:", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити користувачів" },
      { status: 500 }
    );
  }
}
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Ви не авторизовані для виконання цієї дії." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { id, firstName, lastName, email, phoneNumber } =
      profileChangeSchema.parse(body);

    const existingUser = await db.users.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json(
        { error: "Користувач з такою електронною поштою вже існує." },
        { status: 409 }
      );
    }

    const user = await db.users.update({
      where: { id },
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
      },
    });

    return NextResponse.json(
      { message: "Дані профілю успішно оновлено" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Помилка оновлення профілю:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Невірні дані. Перевірте поля та спробуйте ще раз." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Щось пішло не так" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "changePassword") {
      const { id, oldPassword, newPassword } = passwordChangeSchema.parse(body);

      const user = await db.users.findUnique({
        where: { id },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Користувача не знайдено" },
          { status: 404 }
        );
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.pass);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Старий пароль неправильний" },
          { status: 403 }
        );
      }
      if (oldPassword === newPassword) {
        return NextResponse.json(
          { error: "Новий пароль не може співпадати із старим" },
          { status: 400 }
        );
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.users.update({
        where: { id },
        data: { pass: hashedNewPassword },
      });

      return NextResponse.json(
        { message: "Пароль успішно змінено" },
        { status: 200 }
      );
    }

    const { firstName, lastName, email, password, phoneNumber } =
      userSchema.parse(body);
    const existingUser = await db.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Користувач з такою електронною поштою вже існує" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        pass: hashedPassword,
        phone_number: phoneNumber,
        user_role: "User",
      },
    });

    return NextResponse.json(
      { message: "Користувач успішно створений", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Помилка на сервері:", error);
    return NextResponse.json({ error: "Щось пішло не так" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { id, password } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID користувача обов'язковий" },
        { status: 400 }
      );
    }

    const user = await db.users.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 404 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "ID користувача обов'язковий" },
        { status: 401 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.pass);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Невірний пароль" }, { status: 403 });
    }

    await db.users.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Акаунт успішно видалено" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Помилка видалення акаунту:", error);
    return NextResponse.json({ error: "Щось пішло не так" }, { status: 500 });
  }
}
