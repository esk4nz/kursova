import {
  createAddress,
  deleteAddress,
  getAddressesByCity,
} from "../addresses/addresses";
import { createCity, deleteCity, getCities } from "../cities/cities";

export const getRestaurantIdByAddress = async (
  addressId: number
): Promise<number> => {
  const response = await fetch(`/api/restaurants?addressId=${addressId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося отримати ID ресторану");
  }

  const data = await response.json();
  if (!data || !data.id) {
    throw new Error("Ресторан не знайдено за вказаною адресою");
  }

  return data.id;
};

export const createRestaurant = async (
  cityName: string | null,
  addressData: { street_name: string; building_number: string } | null
): Promise<void> => {
  console.log("Назва міста:", cityName);
  try {
    let cityId: number | null = null;
    let addressId: number | null = null;

    if (cityName) {
      const cities = await getCities();

      const existingCity = cities.find(
        (city) => city.city_name.toLowerCase() === cityName.toLowerCase()
      );

      if (existingCity) {
        cityId = existingCity.id;
      } else {
        const cityResponse = await createCity(cityName);
        cityId = cityResponse.id;
        console.log(`Створено нове місто "${cityName}" з ID: ${cityId}`);
      }
    }

    if (addressData && cityId) {
      const addressResponse = await createAddress({
        city_id: cityId,
        street_name: addressData.street_name,
        building_number: addressData.building_number,
      });
      addressId = addressResponse.id;
    }

    if (!addressId) {
      throw new Error("Не вдалося отримати ID адреси");
    }

    const response = await fetch("/api/protected/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_address: addressId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Не вдалося створити ресторан");
    }
  } catch (error: any) {
    throw new Error(
      error.message || "Не вдалося створити ресторан з містом/адресою"
    );
  }
};

export const deleteRestaurant = async (
  restaurantId: number,
  addressId: number,
  cityId: number
): Promise<void> => {
  try {
    // 1. Видалення ресторану
    const deleteRestaurantResponse = await fetch(
      `/api/protected/restaurants?restaurantId=${restaurantId}`,
      { method: "DELETE" }
    );

    if (!deleteRestaurantResponse.ok) {
      const errorData = await deleteRestaurantResponse.json();
      throw new Error(errorData.error || "Не вдалося видалити ресторан.");
    }

    console.log(`Ресторан з ID ${restaurantId} успішно видалено.`);

    // 2. Видалення адреси
    await deleteAddress(addressId);

    // 3. Перевірка залишкових адрес
    const remainingAddresses = await getAddressesByCity(cityId);

    // 4. Видалення міста, якщо адрес більше немає
    if (remainingAddresses.length === 0) {
      await deleteCity(cityId);
    } else {
      console.log(
        `Місто з ID ${cityId} ще має адреси. Видалення не здійснено.`
      );
    }
  } catch (error: any) {
    console.error("Помилка у функції deleteRestaurant:", error.message);
    throw new Error(error.message);
  }
};
