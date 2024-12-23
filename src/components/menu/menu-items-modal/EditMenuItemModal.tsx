"use client";

import React, { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { deletePhoto, uploadPhoto } from "@/app/api/protected/photos/photos";
import { createMenuItem, updateMenuItem } from "@/app/api/menu/menu";

const MenuItemSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова").max(50, "Максимум 50 символів"),
  description: z.string().optional(),
  price: z.preprocess((val) => {
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().min(0.01, "Ціна має бути більше 0")),
  categoryId: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Категорія обов'язкова")
  ),
  photo: z.instanceof(File).optional(),
});

type EditMenuItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  initialData?: {
    id?: number;
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    photoUrl?: string;
  } | null;
  categories: { id: number; name: string }[];
};

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialData = null,
  categories,
}) => {
  const { toast } = useToast();
  const [photo, setPhoto] = useState<File | null>(null);

  const form = useForm<z.infer<typeof MenuItemSchema>>({
    resolver: zodResolver(MenuItemSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      categoryId: initialData?.categoryId || 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof MenuItemSchema>) => {
    try {
      let imageUrl = initialData?.photoUrl || "";

      if (photo) {
        if (initialData?.photoUrl) {
          await deletePhoto(initialData.photoUrl);
        }
        imageUrl = await uploadPhoto(photo);
      }

      const payload = {
        name: data.name,
        description: data.description || "",
        price: data.price,
        categoryId: data.categoryId,
        photoUrl: imageUrl,
      };

      if (initialData) {
        if (initialData.id !== undefined) {
          await updateMenuItem(initialData.id, payload);
        } else {
          throw new Error("ID пункту меню не визначено.");
        }
      } else {
        await createMenuItem(payload);
      }

      toast({
        title: "Успіх",
        description: `Пункт меню ${
          initialData ? "оновлений" : "доданий"
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
          {initialData ? "Редагувати пункт меню" : "Додати пункт меню"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Назва <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть назву" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Опис</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      placeholder="Введіть опис"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ціна <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Введіть ціну"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Категорія <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select className="w-full p-2 border rounded-md" {...field}>
                      <option value="">Оберіть категорію</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mb-4">
              <label className="block text-gray-700">Фото</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) =>
                  setPhoto(e.target.files ? e.target.files[0] : null)
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end">
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

export default EditMenuItemModal;
