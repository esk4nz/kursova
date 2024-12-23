import { z } from "zod";

export type Address = {
  id: number;
  street_name: string;
  building_number: string;
  restaurant_id?: number;
};

export type BookingData = {
  name: string;
  surname: string;
  phone: string;
  email?: string;
  timeSlot: string;
  peopleCount: number;
};

export const reservationSchema = z.object({
  table_id: z.number(),
  customer_name: z.string().min(2),
  customer_surname: z.string().min(2),
  customer_phone: z.string().regex(/^380\d{9}$/),
  email: z.string().email().nullable().optional(),
  date: z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Дата має бути у форматі dd.MM.yyyy"), // Поле date
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Час має бути у форматі HH:mm"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Час має бути у форматі HH:mm"),
  user_id: z.number().nullable().optional(),
  people_count: z.number().min(1),
});

export type ReservationStatus = "active" | "cancelled" | "completed";
export type ReservationCreator = "user" | "admin";

export type Reservation = {
  id: number;
  table_id: number;
  customer_name: string;
  customer_surname: string;
  customer_phone: string;
  email?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  people_count: number;
  status: ReservationStatus;
  created_by: ReservationCreator;
  user_id?: number | null;
};
