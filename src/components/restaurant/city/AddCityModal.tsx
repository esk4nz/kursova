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
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { City } from "@/types/restaurant-components";

type AddCityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddCity: (cityName: string) => void;
  onUpdateCity?: (city: City) => void;
  editingCity?: City;
};

const FormSchema = z.object({
  city_name: z
    .string()
    .min(2, "Назва міста повинна містити принаймні 2 символи")
    .regex(/^[^\d]+$/, "Назва міста не може містити цифри"),
});

const AddCityModal: React.FC<AddCityModalProps> = ({
  isOpen,
  onClose,
  onAddCity,
  onUpdateCity,
  editingCity,
}) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      city_name: editingCity?.city_name || "",
    },
  });

  useEffect(() => {
    if (editingCity) {
      form.reset({ city_name: editingCity.city_name });
    }
  }, [editingCity]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (editingCity && onUpdateCity) {
      onUpdateCity({ ...editingCity, city_name: data.city_name });
      toast({
        title: "Успіх",
        description: "Назва міста успішно оновлена!",
      });
    } else {
      onAddCity(data.city_name);
      toast({
        title: "Успіх",
        description: "Місто успішно додано!",
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {editingCity ? "Редагувати місто" : "Додати нове місто"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="city_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Назва міста <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введіть назву міста" {...field} />
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
                {editingCity ? "Зберегти" : "Додати місто"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddCityModal;
