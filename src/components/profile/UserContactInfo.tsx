"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import DeleteAccountModal from "./DeleteAccountModal";
import ChangePasswordModal from "./ChangePasswordModal";
import EditProfileModal from "./EditProfileModal";
import { useToast } from "@/hooks/use-toast";
import { useSession, signOut } from "next-auth/react";
import {
  changePassword,
  deleteAccountByUser,
  updateUserProfile,
} from "@/app/api/user/user";
import { updateReservationsEmail } from "@/app/api/reservations/reservations";

const UserContactInfo = () => {
  const { toast } = useToast();
  const { data: session, update } = useSession();

  const user = {
    id: session?.user?.id || 0,
    firstName: session?.user?.firstName || "Невідомо",
    lastName: session?.user?.lastName || "Невідомо",
    email: session?.user?.email || "Невідомо",
    phoneNumber: session?.user?.phoneNumber || "Невідомо",
  };

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] =
    useState(false);

  const handleEditProfile = async (updatedData: {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  }) => {
    try {
      const oldEmail = user.email;

      await updateUserProfile(updatedData);

      if (oldEmail !== updatedData.email) {
        await updateReservationsEmail(oldEmail, updatedData.email);
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          phoneNumber: updatedData.phoneNumber,
          email: updatedData.email,
        },
      });
    } catch (error) {
      console.error("Помилка клієнта:", error);
      throw error;
    }
  };

  const handleChangePassword = async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      console.log("Відправляємо дані:", data);
      await changePassword(user.id, data);

      toast({
        title: "Успіх!",
        description: "Пароль успішно змінено.",
      });
    } catch (error) {
      console.error("Помилка на клієнті:", error);
      toast({
        title: "Помилка",
        description:
          error instanceof Error ? error.message : "Не вдалося змінити пароль.",
      });
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await deleteAccountByUser(user.id, password);

      toast({
        title: "Нам дуже прикро(!",
        description: "Ваш акаунт було успішно видалено.",
      });

      setDeleteModalOpen(false);
      setIsLoading(true);

      setTimeout(() => {
        signOut({
          callbackUrl: `${window.location.origin}/`,
          redirect: true,
        });
      }, 1500);
    } catch (error) {
      console.error("Помилка при видаленні акаунту:", error);
      toast({
        title: "Упс",
        description:
          error instanceof Error ? error.message : "Щось пішло не так.",
      });
    }
  };

  return (
    <>
      {/* Екран завантаження */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-lg font-semibold">
            Видалення акаунту...
          </div>
        </div>
      )}

      {/* Контактна інформація */}
      <div className="w-full bg-white shadow-md rounded-lg p-6 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Контактна інформація
        </h2>
        <div className="space-y-6">
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Ваше ім'я:</span>
            <span className="text-gray-500 font-medium border-b border-gray-300 mt-2">
              {user.firstName}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Прізвище:</span>
            <span className="text-gray-500 font-medium border-b border-gray-300 mt-2">
              {user.lastName}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">E-mail / Логін:</span>
            <span className="text-gray-500 font-medium border-b border-gray-300 mt-2">
              {user.email}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Телефон:</span>
            <span className="text-gray-500 font-medium border-b border-gray-300 mt-2">
              +{user.phoneNumber}
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="submit" onClick={() => setEditModalOpen(true)}>
              Редагувати профіль
            </Button>
            <Button
              variant="submit"
              onClick={() => setChangePasswordModalOpen(true)}
            >
              Змінити пароль
            </Button>
            <Button
              onClick={() =>
                signOut({
                  callbackUrl: `${window.location.origin}/sign-in`,
                  redirect: true,
                })
              }
              variant="delete"
            >
              Вийти з аккаунту
            </Button>
          </div>
          {session?.user?.userRole === "User" && (
            <Button
              onClick={() => setDeleteModalOpen(true)}
              variant="link"
              className="text-red-400 underline hover:opacity-75 transition-opacity duration-200"
            >
              Видалення аккаунту
            </Button>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteAccountModal
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {isEditModalOpen && (
        <EditProfileModal
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditProfile}
          currentData={{
            id: user.id, // Передаємо ID
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
          }}
        />
      )}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setChangePasswordModalOpen(false)}
          onSubmit={handleChangePassword}
        />
      )}
    </>
  );
};

export default UserContactInfo;
