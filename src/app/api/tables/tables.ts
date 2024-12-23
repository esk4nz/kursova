import { Reservation } from "@/types/reservations";
import { getRestaurantIdByAddress } from "../restaurants/restaurants";
import { Table } from "@/types/restaurant-components";

export const getTablesByRestaurant = async (
  restaurantId: number
): Promise<Table[]> => {
  const response = await fetch(`/api/tables?restaurantId=${restaurantId}`);
  if (!response.ok) throw new Error("Не вдалося отримати столики");
  return await response.json();
};

export const createTable = async (
  tableData: Omit<Table, "id"> & { address_id: number }
): Promise<Table> => {
  const id_restaurant = await getRestaurantIdByAddress(tableData.address_id);

  const { address_id, ...rest } = tableData;

  const response = await fetch("/api/protected/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...rest, id_restaurant }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося створити столик");
  }

  return await response.json();
};

export const updateTable = async (
  tableData: Table & { address_id: number }
) => {
  const id_restaurant = await getRestaurantIdByAddress(tableData.address_id);

  const response = await fetch(
    `/api/protected/tables?action=update&id=${tableData.id}&addressId=${id_restaurant}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableData.table_number,
        capacity: tableData.capacity,
        status: tableData.status,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося оновити столик");
  }

  return await response.json();
};

export const deleteTable = async (id: number) => {
  const response = await fetch(`/api/protected/tables?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Не вдалося видалити столик");
};

export const updateTableStatuses = async (): Promise<void> => {
  const response = await fetch(`/api/protected/tables/update-statuses`, {
    method: "PUT",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося оновити статуси столиків");
  }

  return await response.json();
};

export const getTodayActiveReservations = async (
  addressId: number
): Promise<Record<number, Reservation[]>> => {
  try {
    const response = await fetch(
      `/api/protected/reservations/today?addressId=${addressId}`
    );

    if (response.status === 404) {
      return {};
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Не вдалося отримати резервації");
    }

    const data = await response.json();

    return data.reduce(
      (acc: Record<number, Reservation[]>, reservation: Reservation) => {
        const tableId = reservation.table_id;
        if (!acc[tableId]) acc[tableId] = [];
        acc[tableId].push(reservation);
        return acc;
      },
      {}
    );
  } catch (error) {
    console.error("Помилка отримання резервацій:", error);
    return {};
  }
};
