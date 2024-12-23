"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "material-react-table";
import {
  Box,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useSession } from "next-auth/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditModal from "./EditPersonReservModal";
import { MRT_Localization_UK } from "material-react-table/locales/uk/index.js";
import DeleteReservationModal from "./DeletePersonReservModal";
import {
  cancelReservationByEmail,
  getReservationsByEmail,
  updateReservationByEmail,
} from "@/app/api/reservations/reservations";
import type { Reservation } from "@/types/reservations";

const ReservationsTable = () => {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Pick<
    Reservation,
    "id" | "customer_name" | "customer_surname" | "customer_phone"
  > | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null);

  useEffect(() => {
    if (!email) return;

    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const data = await getReservationsByEmail(email);
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [email]);

  const handleEdit = (row: MRT_Row<Reservation>) => {
    setEditData({
      id: row.original.id,
      customer_name: row.original.customer_name,
      customer_surname: row.original.customer_surname,
      customer_phone: row.original.customer_phone,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (
    updatedData: Pick<
      Reservation,
      "id" | "customer_name" | "customer_surname" | "customer_phone"
    >
  ) => {
    try {
      const reservationWithAction = {
        ...updatedData,
        action: "editReservation",
      };

      if (email) {
        await fetchReservations(email);
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  const handleDelete = (row: MRT_Row<Reservation>) => {
    setDeleteRowId(row.original.id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteRowId !== null) {
      try {
        await cancelReservationByEmail(deleteRowId);

        setReservations((prevReservations) =>
          prevReservations.filter(
            (reservation) => reservation.id !== deleteRowId
          )
        );

        setIsDeleteModalOpen(false);
        setDeleteRowId(null);
      } catch (error) {
        console.error("Error cancelling reservation:", error);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteRowId(null);
  };

  const fetchReservations = async (userEmail: string) => {
    setIsLoading(true);
    try {
      const data = await getReservationsByEmail(userEmail);
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchReservations(email);
    }
  }, [email]);

  const columns = useMemo<MRT_ColumnDef<Reservation>[]>(() => {
    return [
      {
        accessorKey: "customer_name",
        header: "Ім'я",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          const filter = filterValue.toLowerCase();
          return (
            /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-\s]*$/.test(filterValue) &&
            value.includes(filter)
          );
        },
        Filter: ({ column }) => (
          <TextField
            placeholder="Пошук за ім'ям"
            variant="outlined"
            size="small"
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-\s]*$/.test(value)) {
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
          const filter = filterValue.toLowerCase();
          return (
            /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-\s]*$/.test(filterValue) &&
            value.includes(filter)
          );
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Пошук за прізвищем"
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-\s]*$/.test(value)) {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "customer_phone",
        header: "Телефон",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).replace("+", "");
          return /^\d*$/.test(filterValue) && value.includes(filterValue);
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Пошук за телефоном"
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                column.setFilterValue(value);
              }
            }}
          />
        ),
        Cell: ({ cell }) => `+${cell.getValue<string>()}`,
      },
      {
        accessorKey: "city",
        header: "Місто",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue<string>(id).toLowerCase();
          const filter = filterValue.toLowerCase();
          return (
            /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-\s]*$/.test(filterValue) &&
            value.includes(filter)
          );
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Пошук за містом"
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-\s]*$/.test(value)) {
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
          const filter = filterValue.toLowerCase();
          return (
            /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9\s\-.,]*$/.test(filterValue) &&
            value.includes(filter)
          );
        },
        Filter: ({ column }) => (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Пошук за адресою"
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9\s\-.,]*$/.test(value)) {
                column.setFilterValue(value);
              }
            }}
          />
        ),
      },
      {
        accessorKey: "date",
        header: "Дата",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const rowDate = row.getValue<string>(id);
          const [day, month, year] = rowDate.split(".");
          const formattedRowDate = `${year}-${month}-${day}`;
          return formattedRowDate === filterValue;
        },
        Filter: ({ column }) => {
          const minDate = new Date();
          const maxDate = new Date();
          maxDate.setMonth(maxDate.getMonth() + 3);

          return (
            <TextField
              variant="outlined"
              size="small"
              type="date"
              value={column.getFilterValue() || ""}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                if (selectedDate >= minDate && selectedDate <= maxDate) {
                  column.setFilterValue(e.target.value);
                }
              }}
              slotProps={{
                htmlInput: {
                  min: minDate.toISOString().split("T")[0],
                  max: maxDate.toISOString().split("T")[0],
                },
              }}
            />
          );
        },
        Cell: ({ row }) => {
          const date = row.original.date;
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
          const startTime = row.original.start_time;
          const endTime = row.original.end_time;
          return `${startTime} - ${endTime}`;
        },
      },
      {
        accessorKey: "table_number",
        header: "Номер столика",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "people_count",
        header: "Кількість людей",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ];
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center mt-10">
        Помилка завантаження даних
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <MaterialReactTable
        columns={columns}
        data={reservations}
        localization={MRT_Localization_UK}
        enableEditing
        enableGlobalFilter={false}
        initialState={{ showColumnFilters: true }}
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip title="Редагувати">
              <IconButton onClick={() => handleEdit(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Скасувати">
              <IconButton color="error" onClick={() => handleDelete(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
      <EditModal
        isOpen={isEditModalOpen}
        data={editData}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
      <DeleteReservationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ReservationsTable;
