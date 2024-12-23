"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_Row,
} from "material-react-table";
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteReservationModal from "@/components/profile/person-reservations/DeletePersonReservModal";
import EditModal from "./EditReservationModal";
import { useToast } from "@/hooks/use-toast";
import { MRT_Localization_UK } from "material-react-table/locales/uk/index.js";
import {
  getAllReservations,
  updateReservation,
} from "@/app/api/reservations/reservations";

type Reservation = {
  id: number;
  customer_name: string;
  customer_surname: string;
  customer_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  people_count: number;
  city: string;
  address: string;
  status: "active" | "completed" | "cancelled";
  email: string;
  table_number: number;
};

const ReservationsListTable = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<Reservation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: Reservation[] = await getAllReservations();
      setReservations(data);
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError("Сталася помилка при завантаженні даних");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleEdit = (row: MRT_Row<Reservation>) => {
    console.log({ ...row.original });
    setEditData(row.original);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedData: Partial<Reservation>) => {
    try {
      const data = await updateReservation({
        action: "editReservation",
        ...updatedData,
      });

      const updatedReservation = data.updatedReservation;

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === updatedReservation.id
            ? {
                ...updatedReservation,
              }
            : reservation
        )
      );

      toast({
        title: "Успіх",
        description: "Резервація успішно оновлена.",
      });

      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Error updating reservation:", error);
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося оновити резервацію.",
      });
    }
  };

  const handleDelete = (row: MRT_Row<Reservation>) => {
    setDeleteRowId(row.original.id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteRowId !== null) {
      try {
        const data = await updateReservation({
          id: deleteRowId,
          action: "cancelReservation",
        });

        const updatedReservation = data.updatedReservation;

        // Оновлюємо локальний стан
        setReservations((prev) =>
          prev.map((reservation) =>
            reservation.id === updatedReservation.id
              ? { ...reservation, status: updatedReservation.status }
              : reservation
          )
        );

        toast({
          title: "Успіх",
          description: "Резервацію успішно скасовано.",
        });

        setIsDeleteModalOpen(false);
        setDeleteRowId(null);
      } catch (err) {
        console.error(err);
        setError("Не вдалося скасувати резервацію");
        toast({
          title: "Помилка",
          description: "Не вдалося скасувати резервацію. Спробуйте ще раз.",
        });
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteRowId(null);
  };

  const columns = useMemo<MRT_ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: "customer_name",
        header: "Ім'я",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          return value.includes(filterValue.toLowerCase());
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за ім'ям"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’-]*$/.test(value) || value === "") {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "customer_surname",
        header: "Прізвище",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          return value.includes(filterValue.toLowerCase());
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за прізвищем"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’-]*$/.test(value) || value === "") {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "customer_phone",
        header: "Телефон",
        Cell: ({ cell }) => `+${cell.getValue<string>()}`,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id);
          return value.includes(filterValue);
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="номер телеф."
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
        accessorKey: "email",
        header: "Електронна пошта",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          return value.includes(filterValue.toLowerCase());
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за поштою"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z0-9@.]*$/.test(value) || value === "") {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "city",
        header: "Місто",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          return value.includes(filterValue.toLowerCase());
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за містом"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’-]*$/.test(value) || value === "") {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "address",
        header: "Адреса",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          return value.includes(filterValue.toLowerCase());
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за адресою"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (
                /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'’\-\d\s]*$/.test(value) ||
                value === ""
              ) {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Статус",
        Cell: ({ cell }) => {
          const statusMap: Record<string, string> = {
            active: "Активна",
            completed: "Завершена",
            cancelled: "Скасована",
          };
          return statusMap[cell.getValue<string>()] || "Невідомий";
        },
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
            placeholder="Фільтр за статусом"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            SelectProps={{ native: true }}
          >
            <option value="">Всі</option>
            <option value="active">Активна</option>
            <option value="completed">Завершена</option>
            <option value="cancelled">Скасована</option>
          </TextField>
        ),
      },
      {
        accessorKey: "date",
        header: "Дата",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const rowDate = row.getValue<string>(id); // Формат "dd.MM.yyyy"
          const [day, month, year] = rowDate.split("."); // Розбиваємо на частини
          const formattedRowDate = `${year}-${month}-${day}`; // Перетворюємо в "yyyy-MM-dd"
          return formattedRowDate === filterValue; // Порівняння
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            type="date"
            value={column.getFilterValue() || ""}
            onChange={(e) => column.setFilterValue(e.target.value)} // Очікує формат "yyyy-MM-dd"
          />
        ),
        Cell: ({ row }) => {
          const date = row.original.date; // Формат "dd.MM.yyyy"
          return date || "Немає дати";
        },
      },
      {
        accessorKey: "time_range",
        header: "Час",
        enableColumnFilter: false,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const timeA = parseInt(rowA.original.start_time.replace(":", ""), 10);
          const timeB = parseInt(rowB.original.start_time.replace(":", ""), 10);

          return timeA - timeB;
        },
        Cell: ({ row }) => {
          const startTime = row.original.start_time; // "HH:mm"
          const endTime = row.original.end_time; // "HH:mm"
          return `${startTime} - ${endTime}`;
        },
      },
      {
        accessorKey: "table_number",
        header: "Номер столика",
        enableSorting: true, // Увімкнення сортування
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<number>(id);
          return value.toString().includes(filterValue);
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за номером столика"
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
        accessorKey: "people_count",
        header: "Кількість людей",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<number>(id);
          return value.toString().includes(filterValue);
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Фільтр за кількістю людей"
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
    ],
    []
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div className="overflow-x-auto">
      <MaterialReactTable
        key={reservations.length}
        columns={columns}
        data={reservations}
        localization={MRT_Localization_UK}
        enableEditing
        enableGlobalFilter={false}
        initialState={{
          showColumnFilters: true,
        }}
        renderRowActions={({ row }) => {
          const isActive = row.original.status === "active";
          return (
            <Box sx={{ display: "flex", gap: "1rem" }}>
              {isActive && (
                <Tooltip title="Редагувати">
                  <IconButton onClick={() => handleEdit(row)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isActive && (
                <Tooltip title="Скасувати">
                  <IconButton color="error" onClick={() => handleDelete(row)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        }}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveEdit}
        currentData={
          editData || {
            id: 0,
            customer_name: "",
            customer_surname: "",
            customer_phone: "",
            email: "",
            status: "active",
          }
        }
      />

      <DeleteReservationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ReservationsListTable;
