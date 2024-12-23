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

const profileSchema = z.object({
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

type ChangeProfileFormValues = z.infer<typeof profileSchema>;

type EditProfileModalProps = {
  onClose: () => void;
  onSubmit: (data: z.infer<typeof profileSchema>) => Promise<void>;
  currentData: z.infer<typeof profileSchema>;
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  onClose,
  onSubmit,
  currentData,
}) => {
  const { toast } = useToast();

  const form = useForm<ChangeProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentData,
  });

  const handleSubmit = async (values: ChangeProfileFormValues) => {
    try {
      await onSubmit(values);
      toast({
        title: "Успішно!",
        description: "Дані профілю оновлено",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message || "Користувач з такою поштою вже існує",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Редагувати контактну інформацію
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="firstName"
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
              name="lastName"
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
              name="phoneNumber"
              control={form.control}
              rules={{ required: "Номер телефону обов'язковий" }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Номер телефону <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={"ua"}
                      onlyCountries={["ua"]}
                      disableDropdown={true}
                      placeholder="Введіть номер телефону"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        console.log(value);
                      }}
                      inputStyle={{ width: "100%" }}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message || " "}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Електронна пошта <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть електронну пошту" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button onClick={onClose} variant="cancel" type="button">
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

export default EditProfileModal;
