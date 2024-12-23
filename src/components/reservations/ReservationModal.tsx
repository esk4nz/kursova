"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const BookingSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я обов'язкове")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'-]+$/,
      "Ім'я може містити тільки літери та дефіс"
    ),
  surname: z
    .string()
    .min(2, "Прізвище обов'язкове")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'-]+$/,
      "Прізвище може містити тільки літери та дефіс"
    ),
  phone: z
    .string()
    .regex(/^380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
  email: z
    .string()
    .email("Неправильний формат електронної пошти")
    .optional()
    .or(z.literal("")),
});

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  address: string;
  timeSlot: string;
  date: Date;
  peopleCount: number;
  onSubmit: (data: any) => void;
};

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  city,
  address,
  timeSlot,
  date,
  peopleCount,
  onSubmit,
}) => {
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof BookingSchema>>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      name: "",
      surname: "",
      phone: "",
      email: "",
    },
  });

  const { setValue } = form;

  useEffect(() => {
    if (session) {
      setValue("name", session.user?.firstName || "");
      setValue("surname", session.user?.lastName || "");
      setValue("phone", session.user?.phoneNumber || "");
      setValue("email", session.user?.email || "");
    }
  }, [session, setValue]);

  if (!isOpen) return null;

  const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}.${date.getFullYear()}`;

  const handleFormSubmit = (data: z.infer<typeof BookingSchema>) => {
    onSubmit({
      ...data,
      timeSlot,
      peopleCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Бронювання столика</h2>
        <p>
          <strong>Ресторан:</strong> м.{city}, {address}
        </p>
        <p>
          <strong>Дата:</strong> {formattedDate}
        </p>
        <p>
          <strong>Час:</strong> {timeSlot}
        </p>
        <p>
          <strong>Кількість людей:</strong> {peopleCount}
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ім'я <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть ім'я" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Прізвище <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть прізвище" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Номер телефону <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={"ua"}
                      onlyCountries={["ua"]}
                      disableDropdown
                      placeholder="Введіть номер телефону"
                      value={field.value}
                      onChange={field.onChange}
                      inputStyle={{ width: "100%" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!session && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Введіть email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end mt-4">
              <Button type="button" variant="cancel" onClick={onClose}>
                Скасувати
              </Button>
              <Button type="submit" className="ml-4">
                Підтвердити
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BookingModal;
