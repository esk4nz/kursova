import { Address } from "@/types/restaurant-components";

export const getAddressesByCity = async (
  cityId: number
): Promise<Address[]> => {
  const response = await fetch(`/api/addresses?cityId=${cityId}`);
  if (!response.ok) throw new Error("Не вдалося отримати адреси");
  return await response.json();
};

export const updateAddress = async (addressData: {
  id: number;
  street_name: string;
  building_number: string;
  city_id: number;
}): Promise<{ street_name: string; building_number: string }> => {
  const response = await fetch(`/api/protected/addresses`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося оновити адресу");
  }

  return await response.json();
};
export const createAddress = async (addressData: {
  city_id: number;
  street_name: string;
  building_number: string;
}): Promise<{ id: number }> => {
  const response = await fetch("/api/protected/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося створити адресу");
  }

  return await response.json();
};
export const deleteAddress = async (addressId: number): Promise<void> => {
  const response = await fetch(
    `/api/protected/addresses?addressId=${addressId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Не вдалося видалити адресу");
  }
  //console.log(`Адресу з ID ${addressId} успішно видалено.`);
};
