import { User } from "@/components/users-list/UsersListTable";
import { RegisterFormSchema } from "@/schemas/formSchemas";
import { z } from "zod";
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/protected/user");

  if (!response.ok) {
    throw new Error("Не вдалося завантажити користувачів");
  }

  return await response.json();
};

export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}): Promise<void> => {
  const response = await fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim(),
      password: userData.password,
      phoneNumber: userData.phoneNumber.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Не вдалося створити користувача");
  }

  return data;
};

export const createManager = async (
  managerData: z.infer<typeof RegisterFormSchema>
): Promise<void> => {
  const response = await fetch("/api/protected/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...managerData,
      userRole: "Manager",
    }),
  });

  if (!response.ok) {
    throw new Error("Не вдалося створити менеджера");
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch("/api/protected/user", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error("Не вдалося видалити користувача");
  }
};

export const deleteAccountByUser = async (
  id: number,
  password: string
): Promise<void> => {
  const response = await fetch("/api/user", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Не вдалося видалити акаунт");
  }
};

export const changePassword = async (
  id: number,
  data: { oldPassword: string; newPassword: string }
): Promise<void> => {
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      id,
      action: "changePassword",
    }),
  });

  const errorData = await response.json();

  if (!response.ok) {
    throw new Error(errorData.error || "Не вдалося змінити пароль");
  }
};

export const updateUserProfile = async (updatedData: {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}): Promise<void> => {
  const response = await fetch("/api/user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  const errorData = await response.json();

  if (!response.ok) {
    throw new Error(errorData.error || "Не вдалося оновити профіль");
  }
};
