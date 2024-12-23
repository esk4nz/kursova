"use client";

import { useSession } from "next-auth/react";
import UsersListTable from "@/components/users-list/UsersListTable";
import { Button } from "@/components/ui/button";
import CreateManagerModal from "@/components/users-list/CreateManagerModal";
import { useState } from "react";

const UsersListPage = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="w-full bg-white">
      <h2 className="text-3xl font-bold text-center mt-6 pt-6">
        Список користувачів
      </h2>
      {userRole === "Admin" && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleOpenModal}
            className="mb-4"
            variant="submit"
          >
            Додати менеджера
          </Button>
        </div>
      )}
      <UsersListTable />
      <CreateManagerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default UsersListPage;
