import { Reservation } from "@/types/reservations";

export const getReservationsByRestaurantAndDate = async (
  restaurantId: number,
  date: string
) => {
  const response = await fetch(
    `/api/reservations?restaurantId=${restaurantId}&date=${date}`
  );
  if (!response.ok) {
    throw new Error("Не вдалося отримати резервації");
  }
  return response.json();
};

export const createReservation = async (data: any) => {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося створити резервацію");
  }

  return response.json();
};

export const getReservationsByRestaurantAndDateForUser = async (
  restaurantId: number,
  date: string
) => {
  const response = await fetch(
    `/api/reservations?restaurantId=${restaurantId}&date=${date}`
  );
  if (!response.ok) {
    throw new Error("Не вдалося отримати резервації");
  }
  return response.json();
};

export const getReservationsByEmail = async (email: string) => {
  const response = await fetch(`/api/reservations/by-email?email=${email}`);
  if (!response.ok) {
    throw new Error("Не вдалося отримати резервації");
  }
  return await response.json();
};

export const updateReservationByEmail = async (
  updatedReservation: Partial<Reservation> & { action?: string }
) => {
  const response = await fetch(`/api/reservations/by-email`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedReservation),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося оновити резервацію");
  }
  return await response.json();
};

export const cancelReservationByEmail = async (reservationId: number) => {
  const response = await fetch(`/api/reservations/by-email`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: reservationId,
      action: "cancelReservation",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося скасувати резервацію");
  }

  return await response.json();
};

export const getAllReservations = async () => {
  const response = await fetch(`/api/protected/reservations`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося отримати резервації");
  }

  return await response.json();
};

export const updateReservation = async (
  updatedReservation: Partial<Reservation> & { action?: string }
) => {
  const response = await fetch(`/api/protected/reservations`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedReservation),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося оновити резервацію");
  }

  return await response.json();
};

export const updateReservationsEmail = async (
  oldEmail: string,
  newEmail: string
): Promise<void> => {
  const response = await fetch("/api/reservations/by-email", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "updateEmail",
      oldEmail,
      newEmail,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Не вдалося оновити резервації на новий email"
    );
  }
};
