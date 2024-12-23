"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useEffect, useRef } from "react";

const reservationSchema = z.object({
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
    .or(z.literal("").optional()), // Дозволяє пустий рядок
  status: z.enum(["active", "completed", "cancelled"]),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationFormValues) => Promise<void>;
  currentData: ReservationFormValues | null;
};

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentData,
}) => {
  const { toast } = useToast();
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      id: 0,
      customer_name: "",
      customer_surname: "",
      customer_phone: "",
      email: undefined,
      status: "active",
    },
  });

  const prevData = useRef<ReservationFormValues | null>(null);

  useEffect(() => {
    if (isOpen && currentData && prevData.current !== currentData) {
      const sanitizedData = {
        ...currentData,
        email: currentData.email || "",
      };
      console.log(sanitizedData);
      form.reset(sanitizedData);
      prevData.current = currentData;
    }
  }, [currentData, isOpen, form]);

  const handleSubmit = async (values: ReservationFormValues) => {
    try {
      await onSubmit(values);
      toast({
        title: "Успіх!",
        description: "Резервація оновлена успішно.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося оновити резервацію.",
      });
    }
  };

  const handleClose = () => {
    form.reset(); // Скидання форми при закритті
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Редагувати резервацію</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="customer_name"
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
              name="customer_surname"
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
              name="customer_phone"
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
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value)}
                      inputStyle={{ width: "100%" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Електронна пошта</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введіть електронну пошту"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Статус <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full border rounded p-2"
                    >
                      <option value="active">Активна</option>
                      <option value="completed">Завершена</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button onClick={handleClose} variant="cancel" type="button">
                Скасувати
              </Button>
              <Button variant="submit" type="submit">
                Зберегти
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditModal;
