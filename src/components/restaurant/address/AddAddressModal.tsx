"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AddAddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cityId: number;
  onAddAddress: (address: {
    street_name: string;
    building_number: string;
  }) => void;
  editingAddress?: { street_name: string; building_number: string };
};

const FormSchema = z.object({
  street_name: z
    .string()
    .min(2, "Назва вулиці повинна містити принаймні 2 символи")
    .regex(/^[^\d]+$/, "Назва вулиці не може містити цифри"),
  building_number: z.string().min(1, "Номер будинку не може бути порожнім"),
});

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onAddAddress,
  editingAddress,
}) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      street_name: editingAddress?.street_name || "",
      building_number: editingAddress?.building_number || "",
    },
  });

  useEffect(() => {
    if (editingAddress) {
      form.reset({
        street_name: editingAddress.street_name,
        building_number: editingAddress.building_number,
      });
    } else {
      form.reset({
        street_name: "",
        building_number: "",
      });
    }
  }, [editingAddress]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    onAddAddress(data);
    toast({
      title: editingAddress ? "Зміни збережено" : "Адресу додано",
      description: editingAddress
        ? "Адресу успішно оновлено"
        : "Нова адреса додана успішно!",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {editingAddress ? "Редагувати адресу" : "Додати нову адресу"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="street_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Вулиця <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть назву вулиці" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="building_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Номер будинку <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть номер будинку" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {editingAddress ? "Зберегти зміни" : "Додати адресу"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddAddressModal;
