import * as z from "zod";

export const RegisterFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ім'я обов'язкове та має містити мінімум 2 символ")
      .max(50, "Ім'я не може перевищувати 50 символів")
      .regex(
        /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'-]+$/,
        "Ім'я може містити тільки літери"
      ),

    lastName: z
      .string()
      .min(2, "Прізвище обов'язкове та має містити мінімум 2 символ")
      .max(50, "Прізвище не може перевищувати 50 символів")
      .regex(
        /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'-]+$/,
        "Прізвище може містити тільки літери"
      ),
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
      .min(8, "Пароль має бути мінімум 8 символів")
      .max(50, "Пароль не може перевищувати 50 символів"),
    passwordRepeat: z.string().min(1, "Повторіть пароль"),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    path: ["passwordRepeat"],
    message: "Пароль відрізняється",
  });
