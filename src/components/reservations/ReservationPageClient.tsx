"use client";

import type { Address } from "@/types/reservations";
import type { City } from "@/types/restaurant-components";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BookingModal from "./ReservationModal";
import LoadingTimeSlots from "./LoadingTimeSlots";
import { BookingData } from "@/types/reservations";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { format, isBefore, addMinutes } from "date-fns";
import { getCities } from "@/app/api/cities/cities";
import { getAddressesByCity } from "@/app/api/addresses/addresses";
import {
  createReservation,
  getReservationsByRestaurantAndDateForUser,
} from "@/app/api/reservations/reservations";
import { getTablesByRestaurant } from "@/app/api/tables/tables";

export default function ReservationPageClient() {
  const { toast } = useToast();

  const [cities, setCities] = useState<City[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<number>(2);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const selectedAddressObj = addresses.find(
    (address) => address.id === selectedAddress
  );
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    setIsLoadingCities(true);
    getCities()
      .then((data) => setCities(data))
      .catch((error) => console.error(error))
      .finally(() => setIsLoadingCities(false));
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setIsLoadingAddresses(true);
      setSelectedAddress(null);
      setRestaurantId(null);
      setTables([]);
      setTimeSlots([]);
      setReservations([]);
      getAddressesByCity(selectedCity)
        .then((data) => setAddresses(data))
        .catch((error) => console.error(error))
        .finally(() => setIsLoadingAddresses(false));
    } else {
      setAddresses([]);
      setSelectedAddress(null);
      setRestaurantId(null);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedAddress) {
      const selectedRestaurant = addresses.find(
        (address) => address.id === selectedAddress
      )?.restaurant_id;
      setRestaurantId(selectedRestaurant || null);
      setReservations([]);
      setTables([]);
      setTimeSlots([]);
    } else {
      setRestaurantId(null);
      setReservations([]);
      setTables([]);
      setTimeSlots([]);
    }
  }, [selectedAddress, addresses]);

  useEffect(() => {
    updateTimeSlots();
  }, [restaurantId, selectedDate]);

  const fetchReservations = async () => {
    if (!restaurantId || !selectedDate) {
      setReservations([]);
      setTables([]);
      return;
    }
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    const dateString = `${day}.${month}.${year}`;

    try {
      const fetchedReservations =
        await getReservationsByRestaurantAndDateForUser(
          restaurantId,
          dateString
        );
      const fetchedTables = await getTablesByRestaurant(restaurantId);
      console.log(fetchedReservations);
      setReservations(fetchedReservations);

      setTables(fetchedTables);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
      setTables([]);
    }
  };

  const updateTimeSlots = async () => {
    await fetchReservations();
    generateTimeSlots();
  };

  const createTimeFromString = (time: string): Date => {
    if (!selectedDate) {
      throw new Error("selectedDate не визначено");
    }

    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  useEffect(() => {
    if (restaurantId && selectedDate && selectedPeople) {
      generateTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [restaurantId, selectedDate, selectedPeople, reservations, tables]);

  const generateTimeSlots = () => {
    if (!selectedDate || !tables.length || !selectedCity || !selectedAddress) {
      setTimeSlots([]);
      return;
    }

    setIsLoadingTimeSlots(true);

    const slots: string[] = [];
    const startTimeString = "10:00";
    const endTimeString = "22:00";

    let currentTime = createTimeFromString(startTimeString);
    const endTime = createTimeFromString(endTimeString);

    while (
      isBefore(currentTime, endTime) ||
      currentTime.getTime() === endTime.getTime()
    ) {
      slots.push(format(currentTime, "HH:mm"));
      currentTime = addMinutes(currentTime, 15);
    }

    const filteredSlots = slots.filter((slot) => {
      const slotTime = createTimeFromString(slot);
      const minCapacity = Math.max(selectedPeople, 1);
      const maxCapacity = selectedPeople + 2;

      const availableTables = tables.filter((table) => {
        if (table.capacity < minCapacity || table.capacity > maxCapacity)
          return false;

        const isTableFree = reservations.every((reservation) => {
          const resStart = createTimeFromString(reservation.start_time);
          const resGap = addMinutes(resStart, -120);
          const resEnd = createTimeFromString(reservation.end_time);

          return !(
            reservation.table_id === table.id &&
            slotTime > resGap &&
            slotTime < resEnd
          );
        });

        return isTableFree;
      });

      return availableTables.length > 0;
    });

    setTimeout(() => {
      setTimeSlots(filteredSlots);
      setIsLoadingTimeSlots(false);
    }, 200);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  const handleSlotClick = async (slot: string) => {
    setSelectedTimeSlot(slot);
    fetchReservations();

    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTimeSlot(null);
  };

  const calculateEndTime = (timeSlot: string): string => {
    const [hours, minutes] = timeSlot.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours + 2, minutes);

    if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
      endDate.setHours(23, 59);
    }

    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBookingSubmit = async (data: BookingData) => {
    try {
      const formattedDate = selectedDate
        ? `${selectedDate.getDate().toString().padStart(2, "0")}.${(
            selectedDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}.${selectedDate
            .getFullYear()
            .toString()
            .padStart(4, "0")}`
        : "";

      const startTime = `${data.timeSlot}`;
      const endTime = `${calculateEndTime(data.timeSlot)}`;

      const findAvailableTable = () => {
        const exactTables = tables.filter((table) => {
          return (
            table.capacity === selectedPeople &&
            reservations.every((reservation) => {
              const resStart = createTimeFromString(reservation.start_time);
              const resEnd = createTimeFromString(reservation.end_time);
              return !(
                reservation.table_id === table.id &&
                createTimeFromString(startTime) < resEnd &&
                createTimeFromString(endTime) > resStart
              );
            })
          );
        });

        if (exactTables.length > 0) return exactTables[0];

        const largerTables = tables.filter((table) => {
          return (
            table.capacity > selectedPeople &&
            table.capacity <= selectedPeople + 2 &&
            reservations.every((reservation) => {
              const resStart = createTimeFromString(reservation.start_time);
              const resEnd = createTimeFromString(reservation.end_time);
              return !(
                reservation.table_id === table.id &&
                createTimeFromString(startTime) < resEnd &&
                createTimeFromString(endTime) > resStart
              );
            })
          );
        });

        return largerTables[0] || null;
      };

      let tableToReserve = findAvailableTable();
      while (tableToReserve) {
        try {
          const reservationData = {
            table_id: tableToReserve.id,
            customer_name: data.name,
            customer_surname: data.surname,
            customer_phone: data.phone,
            email: data.email || null,
            date: formattedDate,
            start_time: startTime,
            end_time: endTime,
            user_id: session?.user?.id || null,
            people_count: data.peopleCount,
          };

          await createReservation(reservationData);

          toast({
            title: "Успіх",
            description: "Бронювання успішно створено!",
          });
          setIsModalOpen(false);

          await updateTimeSlots();
          return;
        } catch (error: any) {
          if (error.message?.includes("already reserved")) {
            reservations.push({
              table_id: tableToReserve.id,
              start_time: startTime,
              end_time: endTime,
            });
            tableToReserve = findAvailableTable();
          } else {
            console.error("Error creating reservation:", error);
            break;
          }
        }
      }

      toast({
        title: "Помилка",
        description: "Немає доступних столиків для цього таймслота.",
      });

      generateTimeSlots();
    } catch (error: any) {
      console.error("Error submitting reservation:", error);
      toast({
        title: "Упс",
        description: "Не вдалося створити бронювання. Спробуйте пізніше.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg">
        <label className="block mb-4">
          <span className="block text-gray-700 mb-2">Місто:</span>
          <select
            value={selectedCity || ""}
            onChange={(e) => setSelectedCity(Number(e.target.value))}
            disabled={isLoadingCities || cities.length === 0}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>
              {isLoadingCities ? "Завантаження..." : "Виберіть місто"}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.city_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="block text-gray-700 mb-2">Адреса:</span>
          <select
            value={selectedAddress || ""}
            onChange={(e) => setSelectedAddress(Number(e.target.value))}
            disabled={!selectedCity || isLoadingAddresses}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>
              {isLoadingAddresses ? "Завантаження..." : "Виберіть адресу"}
            </option>
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.street_name}, {address.building_number}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center mb-4">
          <label className="flex-1">
            <span className="block text-gray-700 mb-2">Дата:</span>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Оберіть дату"
              dateFormat="dd.MM.yyyy"
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!selectedCity || !addresses.length}
            />
          </label>

          <label className="ml-4 w-24">
            <span className="block text-gray-700 mb-2">Люди:</span>
            <select
              value={selectedPeople}
              onChange={(e) => setSelectedPeople(Number(e.target.value))}
              disabled={isLoadingCities || cities.length === 0}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!selectedCity || !selectedAddress || !selectedDate ? (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-orange-500">
              Будь ласка, виберіть всі поля.
            </h2>
            <p className="text-gray-600">
              Для перегляду доступних таймслотів виберіть місто, адресу, дату та
              кількість гостей.
            </p>
          </div>
        ) : isLoadingTimeSlots ? (
          <LoadingTimeSlots />
        ) : timeSlots.length > 0 ? (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Доступні таймслоти:
            </h2>
            <ul className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <li
                  key={slot}
                  onClick={() => {
                    handleSlotClick(slot);
                  }}
                  className="p-2 bg-gray-100 text-center rounded-md border border-gray-300 cursor-pointer hover:bg-gray-200"
                >
                  {slot}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-red-500">
              Немає доступних таймслотів.
            </h2>
            <p className="text-gray-600">
              Спробуйте обрати іншу дату або змінити кількість гостей.
            </p>
          </div>
        )}

        <BookingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          city={
            cities.find((city) => city.id === selectedCity)?.city_name || ""
          }
          address={
            selectedAddressObj
              ? `${selectedAddressObj.street_name || ""}, ${
                  selectedAddressObj.building_number || ""
                }`
              : ""
          }
          timeSlot={selectedTimeSlot || ""}
          date={selectedDate!}
          peopleCount={selectedPeople}
          onSubmit={handleBookingSubmit}
        />
      </div>
    </div>
  );
}
