"use client";

import React, { useEffect, useMemo } from "react";
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

const TableSchema = z.object({
  table_number: z
    .string()
    .min(1, "Номер столика обов'язковий")
    .regex(/^\d+$/, "Номер столика має бути числом"),
  capacity: z
    .number({ invalid_type_error: "Місткість обов'язкова" })
    .min(1, "Місткість має бути більшою за 0"),
  status: z.enum(["free", "reserved", "occupied"]),
});

type TableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof TableSchema>) => void;
  defaultValues?: Partial<z.infer<typeof TableSchema>>;
};

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const form = useForm<z.infer<typeof TableSchema>>({
    resolver: zodResolver(TableSchema),
    defaultValues: {
      table_number: "",
      capacity: 2,
      status: "free",
    },
  });

  const isEditing = !!defaultValues?.table_number;

  const isOccupied = defaultValues?.status === "occupied";

  const statusOptions = useMemo(() => {
    if (!isEditing) {
      return [{ label: "Вільний", value: "free", disabled: true }];
    }

    switch (defaultValues?.status) {
      case "free":
        return [
          { label: "Вільний", value: "free", disabled: false },
          { label: "Зайнятий", value: "occupied", disabled: false },
        ];
      case "occupied":
        return [
          { label: "Вільний", value: "free", disabled: false },
          { label: "Зайнятий", value: "occupied", disabled: false },
        ];
      case "reserved":
        return [{ label: "Заброньований", value: "reserved", disabled: true }];
      default:
        return [];
    }
  }, [defaultValues, isEditing]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        table_number: defaultValues?.table_number || "",
        capacity: defaultValues?.capacity || 2,
        status: defaultValues?.status || "free",
      });
    }
  }, [isOpen, defaultValues]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Редагувати столик" : "Додати столик"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="table_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Номер столика <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Введіть номер столика"
                      disabled={isOccupied}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Місткість <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded-md"
                      disabled={isOccupied}
                    >
                      {[2, 4, 6, 8, 10].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
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
                      {...field}
                      className="w-full p-2 border rounded-md"
                      disabled={!isEditing}
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
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
              <Button
                variant="submit"
                type="submit"
                disabled={!isEditing && form.watch("status") !== "free"}
              >
                Зберегти
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TableModal;
