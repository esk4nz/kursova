"use client";

import { Button } from "../ui/button";
import { useSession } from "next-auth/react";

type UserAccountNavProps = {
  setActivePage: (page: string) => void;
};

const UserAccountNav: React.FC<UserAccountNavProps> = ({ setActivePage }) => {
  const { data: session } = useSession();
  const isUser = session?.user?.userRole === "User";
  return (
    <nav className="bg-white shadow-md rounded-lg p-6 w-full">
      <ul className="space-y-4">
        <li>
          <Button
            variant="link"
            className="w-full text-center"
            onClick={() => setActivePage("contactInfo")}
          >
            Контактна інформація
          </Button>
        </li>
        {isUser && (
          <li>
            <Button
              variant="link"
              className="w-full text-center"
              onClick={() => setActivePage("reservations")}
            >
              Наявні бронювання
            </Button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default UserAccountNav;
