"use client";

import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import AddCityModal from "./city/AddCityModal";
import AddAddressModal from "./address/AddAddressModal";
import { useToast } from "@/hooks/use-toast";

import { getCities } from "@/app/api/cities/cities";
import { getAddressesByCity } from "@/app/api/addresses/addresses";
import { createRestaurant } from "@/app/api/restaurants/restaurants";
import type { Address, CityAdd } from "@/types/restaurant-components";

const RestaurantSchema = z.object({
  city_id: z
    .number()
    .min(1, "Будь ласка, виберіть місто")
    .transform((val) => Number(val)),
  address_id: z
    .number()
    .min(1, "Будь ласка, виберіть адресу")
    .transform((val) => Number(val)),
});

type RestaurantFormValues = z.infer<typeof RestaurantSchema>;

type AddRestaurantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [cities, setCities] = useState<CityAdd[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [tempCity, setTempCity] = useState<string | null>(null);
  const [tempAddress, setTempAddress] = useState<{
    street_name: string;
    building_number: string;
  } | null>(null);

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(RestaurantSchema),
    defaultValues: {
      city_id: 0,
      address_id: 0,
    },
  });

  const city_id = form.watch("city_id");
  const address_id = form.watch("address_id");

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    // Якщо місто вибране, витягаємо адреси, окрім тимчасового міста
    if (city_id) {
      const selectedCity = cities.find((city) => city.id === city_id);

      // Якщо це "тимчасове" місто, не підвантажуємо адреси з бекенду
      if (selectedCity?.isTemporary) {
        setAddresses([]);
        return;
      }

      fetchAddresses(city_id);
    } else {
      setAddresses([]);
    }
  }, [city_id, cities]);

  const fetchCities = async () => {
    try {
      const data = await getCities();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchAddresses = async (cityId: number) => {
    try {
      const data = await getAddressesByCity(cityId);
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const onSubmit = async (data: RestaurantFormValues) => {
    try {
      let cityNameToUse = tempCity;

      // Якщо не було додано нового міста через модалку,
      // беремо назву з обраного міста
      if (!tempCity && data.city_id) {
        const selectedCity = cities.find((city) => city.id === data.city_id);
        cityNameToUse = selectedCity ? selectedCity.city_name : null;
      }

      // Якщо не вибрали ані місто, ані адресу як тимчасові —
      // виводимо помилку
      if (!cityNameToUse && !tempAddress) {
        toast({
          title: "Помилка",
          description:
            "Будь ласка, виберіть нове місто чи адресу для створення нового ресторану.",
        });
        return;
      }

      await createRestaurant(cityNameToUse, tempAddress);

      toast({
        title: "Успіх",
        description: "Ресторан успішно створено!",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося створити ресторан.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Додати новий ресторан</h2>

          {/* Обгортка форми за допомогою компонентів <Form> та <form> */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Поле вибору міста */}
              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Місто <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex">
                      <FormControl>
                        <select
                          value={field.value || 0}
                          onChange={(e) => {
                            const newCityId = Number(e.target.value);
                            form.setValue("city_id", newCityId);
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value={0}>Оберіть місто</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.city_name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <Button
                        variant="submit"
                        type="button"
                        onClick={() => setIsCityModalOpen(true)}
                        className="ml-2"
                      >
                        Додати місто
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Адреса <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex">
                      <FormControl>
                        <select
                          value={field.value || 0}
                          onChange={(e) => {
                            const newAddressId = Number(e.target.value);
                            form.setValue("address_id", newAddressId);
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value={0}>Оберіть адресу</option>
                          {addresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.street_name}, {address.building_number}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <Button
                        variant={city_id ? "submit" : "notAllowed"}
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="ml-2"
                        disabled={!city_id}
                      >
                        Додати адресу
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button
                  variant="cancel"
                  type="button"
                  onClick={onClose}
                  className="mr-4"
                >
                  Скасувати
                </Button>
                <Button
                  variant={city_id && address_id ? "submit" : "notAllowed"}
                  type="submit"
                  disabled={!city_id || !address_id}
                >
                  Додати ресторан
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {isCityModalOpen && (
        <AddCityModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          onAddCity={(cityName) => {
            const cityExists = cities.some(
              (city) => city.city_name.toLowerCase() === cityName.toLowerCase()
            );
            if (cityExists) {
              toast({
                title: "Помилка",
                description: "Місто з таким ім'ям вже існує.",
              });
              return;
            }

            const newCityId = Date.now();
            setCities((prevCities) => {
              const filteredCities = prevCities.filter(
                (city) => !city.isTemporary
              );
              return [
                ...filteredCities,
                {
                  id: newCityId,
                  city_name: cityName,
                  isTemporary: true,
                },
              ];
            });

            setTempCity(cityName);
            form.setValue("city_id", newCityId);
          }}
        />
      )}

      {isAddressModalOpen && (
        <AddAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          cityId={city_id}
          onAddAddress={(address) => {
            const addressExists = addresses.some(
              (addr) =>
                addr.street_name.toLowerCase() ===
                  address.street_name.toLowerCase() &&
                addr.building_number.toLowerCase() ===
                  address.building_number.toLowerCase()
            );
            if (addressExists) {
              toast({
                title: "Помилка",
                description: "Така адреса вже існує для цього міста.",
              });
              return;
            }

            const newAddressId = Date.now();
            setAddresses((prevAddresses) => {
              const filteredAddresses = prevAddresses.filter(
                (addr) => !addr.isTemporary
              );
              return [
                ...filteredAddresses,
                {
                  id: newAddressId,
                  street_name: address.street_name,
                  building_number: address.building_number,
                  isTemporary: true,
                },
              ];
            });

            setTempAddress(address);
            form.setValue("address_id", newAddressId);
          }}
        />
      )}
    </>
  );
};

export default AddRestaurantModal;
