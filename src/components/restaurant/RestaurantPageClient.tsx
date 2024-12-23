"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "material-react-table";
import { MRT_Localization_UK } from "material-react-table/locales/uk/index.js";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRestaurantModal from "@/components/restaurant/AddRestaurantModal";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { getCities } from "@/app/api/cities/cities";
import {
  deleteTable,
  updateTable,
  getTablesByRestaurant,
  createTable,
  updateTableStatuses,
  getTodayActiveReservations,
} from "@/app/api/tables/tables";
import { getAddressesByCity } from "@/app/api/addresses/addresses";
import TableModal from "@/components/restaurant/tables/TableModal";
import DeleteTableModal from "@/components/restaurant/tables/DeleteTableModal";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useToast } from "@/hooks/use-toast";
import EditCityButton from "@/components/restaurant/city/EditCityButton";
import EditAddressButton from "@/components/restaurant/address/EditAddressButton";
import DeleteRestaurantModal from "@/components/restaurant/DeleteRestaurantModal";
import {
  deleteRestaurant,
  getRestaurantIdByAddress,
} from "@/app/api/restaurants/restaurants";
import { Reservation } from "@/types/reservations";
import { updateReservation } from "@/app/api/reservations/reservations";
import type { Address, City, Table } from "@/types/restaurant-components";

const RestaurantPageClient = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [isAddRestaurantModalOpen, setIsAddRestaurantModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<{
    table_number: number;
    address: string;
    id: number;
  } | null>(null);
  const [isDeleteRestaurantModalOpen, setIsDeleteRestaurantModalOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [reservations, setReservations] = useState<
    Record<number, Reservation[]>
  >({});

  const openTableModal = (table?: Table) => {
    setEditingTable(table || null);
    setIsTableModalOpen(true);
  };

  // Закриття модального вікна
  const closeTableModal = () => {
    setEditingTable(null);
    setIsTableModalOpen(false);
  };

  // Fetch Cities
  useEffect(() => {
    setIsLoadingCities(true);
    getCities()
      .then((data) => {
        setCities(data);
        setIsLoadingCities(false);
      })
      .catch((error) => {
        console.error("Error fetching cities:", error);
        setIsLoadingCities(false);
      });
  }, []);

  // Fetch Addresses
  useEffect(() => {
    if (selectedCity) {
      setIsLoadingAddresses(true);
      getAddressesByCity(selectedCity)
        .then((data) => {
          setAddresses(data);
          if (data.length > 0) {
            setSelectedAddress(data[0].id);
          } else {
            setSelectedAddress(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching addresses:", error);
        })
        .finally(() => {
          setIsLoadingAddresses(false);
        });
    } else {
      setAddresses([]);
      setSelectedAddress(null);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedAddress) {
      setIsLoading(true);
      Promise.all([
        getTablesByRestaurant(selectedAddress),
        fetchTodayActiveReservations(selectedAddress),
      ])
        .then(([tablesData, reservationsData]) => {
          setTables(tablesData);
          setReservations(reservationsData);
        })
        .catch((error) => {
          console.error("Error fetching tables or reservations:", error);
          toast({
            title: "Помилка",
            description: "Не вдалося завантажити дані.",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedAddress, refreshKey]);

  const handleCreate = async (values: Omit<Table, "id">) => {
    if (!selectedAddress) return;

    const tableNumber = Number(values.table_number);
    const capacity = Number(values.capacity);

    if (
      isNaN(tableNumber) ||
      isNaN(capacity) ||
      tableNumber <= 0 ||
      capacity <= 0
    ) {
      toast({
        title: "Упс",
        description:
          "Номер столика та місткість повинні бути позитивними числами.",
      });
      return;
    }

    try {
      const newTable = await createTable({
        ...values,
        table_number: tableNumber,
        capacity: capacity,
        status: "free",
        address_id: selectedAddress,
      });

      setTables((prev) => [...prev, newTable]);
      closeTableModal();
      toast({
        title: "Успіх",
        description: "Столик успішно створено.",
      });
    } catch (error: any) {
      if (
        error.message === "Table number must be unique within the restaurant."
      ) {
        toast({
          title: "Помилка",
          description: "Номер столика має бути унікальним у межах ресторану.",
        });
      } else {
        toast({
          title: "Помилка",
          description: "Не вдалося створити столик. Спробуйте ще раз.",
        });
      }
    }
  };

  const handleSave = async (values: Table) => {
    if (!values.id || !selectedAddress) {
      toast({
        title: "Упс",
        description: "Не вдалося оновити столик. ID або адреса не знайдені.",
      });
      return;
    }

    const tableNumber = Number(values.table_number);
    const capacity = Number(values.capacity);

    if (
      isNaN(tableNumber) ||
      isNaN(capacity) ||
      tableNumber <= 0 ||
      capacity <= 0
    ) {
      toast({
        title: "Упс",
        description:
          "Номер столика та місткість повинні бути позитивними числами.",
      });
      return;
    }

    try {
      const updatedTable = await updateTable({
        ...values,
        address_id: selectedAddress,
      });

      setTables((prev) =>
        prev.map((table) =>
          table.id === updatedTable.id ? updatedTable : table
        )
      );
      closeTableModal();
      toast({
        title: "Успіх",
        description: "Столик успішно оновлено.",
      });
    } catch (error: any) {
      if (
        error.message === "Table number must be unique within the restaurant."
      ) {
        toast({
          title: "Помилка",
          description: "Номер столика має бути унікальним у межах ресторану.",
        });
      } else {
        console.log(error);
        toast({
          title: "Помилка",
          description: "Не вдалося оновити столик. Спробуйте ще раз.",
        });
      }
    }
  };

  const handleDeleteRequest = (row: MRT_Row<Table>) => {
    const address = addresses.find((a) => a.id === selectedAddress);
    const restaurantAddress = address
      ? `${address.street_name}, ${address.building_number}`
      : "Невідома адреса";

    setTableToDelete({
      table_number: row.original.table_number,
      address: restaurantAddress,
      id: row.original.id,
    });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tableToDelete) return;

    try {
      await deleteTable(tableToDelete.id);
      setTables((prev) =>
        prev.filter((table) => table.id !== tableToDelete.id)
      );
      toast({
        title: "Успішно",
        description: `Столик №${tableToDelete.table_number} видалено.`,
      });
    } catch (error) {
      console.error("Error deleting table:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося видалити столик. Спробуйте ще раз.",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setTableToDelete(null);
    }
  };

  const handleTableSubmit = async (data: {
    table_number: string;
    capacity: number;
    status: "free" | "reserved" | "occupied";
  }) => {
    const tableNumber = Number(data.table_number);
    if (editingTable) {
      await handleSave({ ...editingTable, ...data, table_number: tableNumber });
    } else {
      await handleCreate({ ...data, table_number: tableNumber });
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "free":
        return "Вільний";
      case "reserved":
        return "Заброньований";
      case "occupied":
        return "Зайнятий";
      default:
        return status;
    }
  };
  const columns = useMemo<MRT_ColumnDef<Table>[]>(() => {
    return [
      {
        accessorKey: "table_number",
        header: "Номер столика",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id);
          return String(value).includes(filterValue);
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="фільтр по номеру столика"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value) || value === "") {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "capacity",
        header: "Місткість",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id);
          return String(value).includes(filterValue);
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="фільтр по місткості столика"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value) || value === "") {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },

      {
        accessorKey: "status",
        header: "Статус",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id);
          return value === filterValue;
        },
        Filter: ({ column }) => (
          <TextField
            select
            variant="outlined"
            size="small"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Усі</option>
            <option value="free">Вільний</option>
            <option value="reserved">Зарезервований</option>
            <option value="occupied">Зайнятий</option>
          </TextField>
        ),
        Cell: ({ cell }) => translateStatus(cell.getValue<string>()),
      },
    ];
  }, []);

  const handleDeleteRestaurant = async () => {
    if (!selectedAddress || !selectedCity) {
      toast({
        title: "Помилка",
        description: "Будь ласка, виберіть місто та адресу.",
      });
      return;
    }

    try {
      const restaurantId = await getRestaurantIdByAddress(selectedAddress);
      const addressId = selectedAddress;
      const cityId = selectedCity;

      await deleteRestaurant(restaurantId, addressId, cityId);

      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      if (addresses.length === 1) {
        setCities((prev) => prev.filter((c) => c.id !== cityId));
        setSelectedCity(null);
      }
      setSelectedAddress(null);
      toast({
        title: "Успіх",
        description: "Ресторан, адреса та місто (якщо потрібно) видалено.",
      });
      setIsDeleteRestaurantModalOpen(false);
    } catch (error: any) {
      console.error("Error during deletion:", error.message);
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося видалити ресторан.",
      });
    }
  };

  const updateTableStatusesPeriodically = async () => {
    try {
      setIsLoading(true);

      await updateTableStatuses();

      setRefreshKey((prev) => prev + 1);

      toast({
        title: "Успіх",
        description: "Статуси столиків оновлено",
      });
    } catch (error: any) {
      console.error("Помилка:", error);
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося оновити статуси столиків.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateTableStatusesPeriodically();
    }, 5 * 60 * 1000); // 5 * 60 * 1000 5 хвилин у мілісекундах

    return () => clearInterval(interval);
  }, []);

  const fetchTodayActiveReservations = async (addressId: number) => {
    try {
      const reservations = await getTodayActiveReservations(addressId);

      return reservations;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return {};
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return phone;
  };

  const renderDetailPanel = ({ row }: { row: MRT_Row<Table> }) => {
    const tableId = row.original.id;
    const tableReservations = reservations[tableId] || [];

    const updateReservationStatus = async (
      reservationId: number,
      action: string
    ) => {
      try {
        const updatedReservation = await updateReservation({
          id: reservationId,
          action: action,
        });

        toast({
          title: "Успіх",
          description: `Резервація успішно оновлена`,
        });

        updateTableStatusesPeriodically();
        setRefreshKey((prev) => prev + 1);

        return updatedReservation;
      } catch (error: any) {
        console.error("Помилка при оновленні статусу резервації:", error);

        toast({
          title: "Помилка",
          description:
            error.message || "Не вдалося оновити резервацію. Спробуйте ще раз.",
        });

        throw error;
      }
    };

    return (
      <Box sx={{ padding: 2 }}>
        {tableReservations.length > 0 ? (
          <Box component="ul" sx={{ padding: 0, margin: 0, listStyle: "none" }}>
            {tableReservations.map((reservation) => (
              <Box
                component="li"
                key={reservation.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <span>
                  {reservation.start_time} - {reservation.end_time}
                </span>
                <span>
                  {reservation.customer_surname} {reservation.customer_name}
                </span>
                <span>{formatPhoneNumber(reservation.customer_phone)}</span>
                <span>{reservation.people_count} осіб</span>
                {reservation.status === "active" && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="delete"
                      color="secondary"
                      size="sm"
                      onClick={() =>
                        updateReservationStatus(
                          reservation.id,
                          "cancelReservation"
                        )
                      }
                    >
                      Скасувати
                    </Button>
                    <Button
                      variant="add"
                      color="primary"
                      size="sm"
                      onClick={() =>
                        updateReservationStatus(
                          reservation.id,
                          "completeReservation"
                        )
                      }
                    >
                      Закінчити
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box>Немає резервацій</Box>
        )}
      </Box>
    );
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        {/* Блок з містом */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="w-16">Місто:</span>
            <select
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(Number(e.target.value))}
              disabled={isLoadingCities || cities.length === 0}
              className="border border-gray-300 rounded px-2 py-1  w-64 h-9"
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
          <EditCityButton
            selectedCity={cities.find((c) => c.id === selectedCity) || null}
            onUpdateCity={() => {
              window.location.reload();
            }}
          />
        </div>

        {/* Блок з адресою */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 ">
            <span className="w-16">Адреса:</span>
            <select
              value={selectedAddress || ""}
              onChange={(e) => setSelectedAddress(Number(e.target.value))}
              disabled={!selectedCity || isLoadingAddresses}
              className=" border border-gray-300 rounded px-2 py-1 w-64 h-9"
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
          <EditAddressButton
            selectedAddress={
              addresses.find((addr) => addr.id === Number(selectedAddress)) ||
              null
            }
            cityId={selectedCity!}
            onUpdateAddress={(updatedAddress) => {
              setAddresses((prev) =>
                prev.map((addr) =>
                  addr.id === updatedAddress.id ? updatedAddress : addr
                )
              );
            }}
          />
        </div>
      </div>

      {/* Кнопка для створення ресторану */}
      <div className="flex justify-end gap-4 mt-4 mb-3">
        <Button
          variant="submit"
          onClick={() => setIsAddRestaurantModalOpen(true)}
        >
          Додати ресторан
        </Button>
        <Button
          variant="delete"
          disabled={!selectedAddress || !selectedCity}
          onClick={() => setIsDeleteRestaurantModalOpen(true)}
        >
          Видалити ресторан
        </Button>
      </div>

      {/* Таблиця */}

      {selectedCity && selectedAddress ? (
        isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <MaterialReactTable
            localization={MRT_Localization_UK}
            columns={columns}
            data={tables}
            enableEditing={true}
            enableExpanding={true}
            initialState={{
              showColumnFilters: true,
            }}
            renderDetailPanel={renderDetailPanel}
            getRowId={(row) => row.id.toString()}
            muiToolbarAlertBannerProps={
              isError
                ? {
                    color: "error",
                    children: "Не вдалося завантажити столики.",
                  }
                : undefined
            }
            renderRowActions={({ row }) => {
              const { status } = row.original;

              return (
                <Box sx={{ display: "flex", gap: "1rem" }}>
                  <Tooltip
                    title={
                      status === "reserved"
                        ? "Недоступно для зарезервованих столиків"
                        : "Редагувати"
                    }
                  >
                    <span>
                      <IconButton
                        onClick={() => openTableModal(row.original)}
                        disabled={status === "reserved"} // Заборонено редагування для reserved
                      >
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      status === "reserved"
                        ? "Недоступно для зарезервованих столиків"
                        : status === "occupied"
                        ? "Видалення недоступне для зайнятих столиків"
                        : "Видалити"
                    }
                  >
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteRequest(row)}
                        disabled={status !== "free"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            }}
            renderTopToolbarCustomActions={() => (
              <div className="flex items-center justify-between gap-4 w-full">
                <Tooltip arrow title="Оновити статус столиків">
                  <IconButton onClick={updateTableStatusesPeriodically}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="submit"
                  onClick={() => openTableModal()}
                  disabled={!selectedCity || !selectedAddress || isLoading}
                  className="ml-auto"
                >
                  Додати столик
                </Button>
              </div>
            )}
          />
        )
      ) : (
        <Box sx={{ textAlign: "center", minHeight: "300px", padding: "20px" }}>
          <p>Будь ласка, виберіть місто та адресу для перегляду столиків.</p>
        </Box>
      )}

      <TableModal
        isOpen={isTableModalOpen}
        onClose={closeTableModal}
        onSubmit={handleTableSubmit}
        defaultValues={
          editingTable
            ? {
                table_number: String(editingTable.table_number || ""), // Конвертуємо в рядок
                capacity: editingTable.capacity,
                status: editingTable.status,
              }
            : {
                table_number: "", // Пустий рядок для нового столика
                capacity: 2,
                status: "free",
              }
        }
      />

      {isAddRestaurantModalOpen && (
        <AddRestaurantModal
          isOpen={isAddRestaurantModalOpen}
          onClose={() => setIsAddRestaurantModalOpen(false)}
          onUpdate={() => {
            window.location.reload();
          }}
        />
      )}

      {isDeleteModalOpen && tableToDelete && (
        <DeleteTableModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          tableNumber={tableToDelete.table_number ?? 0}
          restaurantAddress={`${tableToDelete.address ?? "N/A"}`}
        />
      )}

      {isDeleteRestaurantModalOpen && (
        <DeleteRestaurantModal
          onClose={() => setIsDeleteRestaurantModalOpen(false)}
          onConfirm={handleDeleteRestaurant}
          restaurantAddress={`у місті ${
            cities.find((city) => city.id === selectedCity)?.city_name ||
            "Невідоме місто"
          }, за адресою ${
            addresses.find((addr) => addr.id === selectedAddress)
              ?.street_name || "Невідома вулиця"
          }, ${
            addresses.find((addr) => addr.id === selectedAddress)
              ?.building_number || "N/A"
          }`}
        />
      )}
    </div>
  );
};

export default RestaurantPageClient;
