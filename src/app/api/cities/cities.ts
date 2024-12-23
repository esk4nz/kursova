import { City } from "@/types/restaurant-components";

export const getCities = async (): Promise<City[]> => {
  const response = await fetch("/api/cities");
  if (!response.ok) throw new Error("Не вдалося отримати міста");
  return await response.json();
};

export const updateCity = async (cityData: {
  id: number;
  city_name: string;
}): Promise<City> => {
  const response = await fetch(`/api/protected/cities`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cityData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося оновити місто");
  }

  return await response.json();
};

export const createCity = async (cityName: string): Promise<{ id: number }> => {
  const response = await fetch("/api/protected/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city_name: cityName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося створити місто");
  }

  return await response.json();
};

export const deleteCity = async (cityId: number): Promise<void> => {
  const response = await fetch(`/api/protected/cities?cityId=${cityId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося видалити місто");
  }
  //console.log(`Місто з ID ${cityId} успішно видалено.`);
};
