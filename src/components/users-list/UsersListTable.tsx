"use client";

import { useEffect, useState } from "react";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { useSession } from "next-auth/react";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteAccountModal from "./DeleteAccountModal";
import { TextField } from "@mui/material";
import { MRT_Localization_UK } from "material-react-table/locales/uk/index.js";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, getUsers } from "@/app/api/user/user";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userRole: string;
};

const UsersListTable = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const userRole = session?.user?.userRole || "Manager";

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const data = await getUsers();

      const filteredData = data.filter((user) => {
        if (userRole === "Admin") return user.userRole !== "Admin";
        if (userRole === "Manager") return user.userRole === "User";
        return false;
      });

      setUsers(filteredData);
    } catch (err) {
      console.error("Помилка завантаження користувачів:", err);
      setError("Помилка завантаження користувачів");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchUsers();
  }, [session?.user, userRole]);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      toast({
        title: "Успіх",
        description: "Користувача успішно видалено.",
      });
    } catch (err) {
      console.error("Помилка видалення:", err);
      setError("Не вдалося видалити користувача");

      toast({
        title: "Помилка",
        description: "Не вдалося видалити користувача.",
      });
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      handleDelete(selectedUser.id);
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  const columns: MRT_ColumnDef<User>[] = [
    {
      header: "Дії",
      id: "actions",
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Tooltip title="Видалити">
          <IconButton
            color="error"
            onClick={() => openDeleteModal(row.original)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      accessorKey: "firstName",
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
            if (/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-]*$/.test(value) || value === "") {
              column.setFilterValue(value);
            }
          }}
        />
      ),
    },
    {
      accessorKey: "lastName",
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
            if (/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'\-]*$/.test(value) || value === "") {
              column.setFilterValue(value);
            }
          }}
        />
      ),
    },
    {
      accessorKey: "email",
      header: "Пошта",
      Filter: ({ column }) => (
        <TextField
          variant="outlined"
          size="small"
          placeholder="Фільтр за поштою"
          value={column.getFilterValue() ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
        />
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Телефон",
      Cell: ({ cell }) => `+${cell.getValue<string>()}`,
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        const value = row.getValue<string>(id);
        const formattedValue = value.replace("+", "");
        return (
          /^\d*$/.test(filterValue) && formattedValue.includes(filterValue)
        );
      },
      Filter: ({ column }) => (
        <TextField
          variant="outlined"
          size="small"
          placeholder="Фільтр за телефоном"
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
      accessorKey: "userRole",
      header: "Роль",
      Filter: ({ column }) => (
        <TextField
          select
          variant="outlined"
          size="small"
          value={column.getFilterValue() ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder="Виберіть роль"
          fullWidth
        >
          {userRole === "Manager"
            ? [
                <MenuItem key="user" value="User">
                  User
                </MenuItem>,
              ]
            : [
                <MenuItem key="all" value="">
                  Всі ролі
                </MenuItem>,
                <MenuItem key="user" value="User">
                  User
                </MenuItem>,
                <MenuItem key="manager" value="Manager">
                  Manager
                </MenuItem>,
              ]}
        </TextField>
      ),
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        return row.getValue<string>(id) === filterValue;
      },
    },
  ];

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
        columns={columns}
        localization={MRT_Localization_UK}
        data={users}
        enableGlobalFilter={false}
        initialState={{ showColumnFilters: true }}
      />
      {isModalOpen && selectedUser && (
        <DeleteAccountModal
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          userData={{
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            email: selectedUser.email,
          }}
        />
      )}
    </div>
  );
};

export default UsersListTable;
