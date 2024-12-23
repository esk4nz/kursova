"use client";

import React from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  createCategory,
  updateCategory,
} from "@/app/api/categories/categories";

// Схема валідації
const CategorySchema = z.object({
  name: z
    .string()
    .min(1, "Назва категорії обов'язкова")
    .max(50, "Максимум 50 символів"),
});

type EditCategoryModal = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  initialData?: { id?: number; name: string } | null;
};

const EditCategoryModal: React.FC<EditCategoryModal> = ({
  isOpen,
  onClose,
  onUpdate,
  initialData = null,
}) => {
  const { toast } = useToast();

  // Ініціалізація форми
  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  // Обробка відправки форми
  const onSubmit = async (data: z.infer<typeof CategorySchema>) => {
    try {
      if (initialData && initialData.id !== undefined) {
        await updateCategory({ id: initialData.id, name: data.name });
      } else {
        await createCategory({ name: data.name });
      }

      toast({
        title: "Успіх",
        description: `Категорія ${
          initialData ? "оновлена" : "додана"
        } успішно.`,
      });

      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Помилка",
        description: String(error),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Редагувати категорію" : "Додати категорію"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Назва категорії <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть назву категорії" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="cancel"
                type="button"
                onClick={onClose}
                className="mr-4"
              >
                Скасувати
              </Button>
              <Button variant="submit" type="submit">
                {initialData ? "Оновити" : "Додати"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
