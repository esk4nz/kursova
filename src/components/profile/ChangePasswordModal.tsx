"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Схема перевірки для паролів
const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Старий пароль обов'язковий")
      .min(8, "Пароль має бути не менше 8 символів"),
    newPassword: z.string().min(8, "Новий пароль має бути не менше 8 символів"),
    confirmNewPassword: z
      .string()
      .min(1, "Підтвердження нового пароля обов'язкове"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"], // Вказуємо, яке поле викликає помилку
    message: "Новий пароль і підтвердження не співпадають",
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type ChangePasswordModalProps = {
  onClose: () => void;
  onSubmit: (data: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<void>;
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await onSubmit(values);
      toast({
        title: "Успішно!",
        description: "Пароль змінено успішно.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message || "Щось пішло не так. Спробуйте ще раз.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Зміна пароля</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Старий пароль <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Введіть старий пароль"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Новий пароль <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Введіть новий пароль"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Підтвердження нового пароля{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Повторіть новий пароль"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="cancel" onClick={onClose} type="button">
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

export default ChangePasswordModal;
