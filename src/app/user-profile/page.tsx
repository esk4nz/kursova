"use client";

import UserContactInfo from "@/components/profile/UserContactInfo";
import UserAccountNav from "@/components/profile/UserAccountNav";
import { useState } from "react";
import ReservationsPage from "@/components/profile/person-reservations/PersonReservationsPage";

const UserProfilePage = () => {
  const [activePage, setActivePage] = useState("contactInfo");

  const renderContent = () => {
    if (activePage === "contactInfo") {
      return <UserContactInfo />;
    }
    if (activePage === "reservations") {
      return <ReservationsPage />;
    }
  };

  return (
    <div className="flex flex-wrap">
      <aside className="w-full md:w-1/4 p-6">
        <UserAccountNav setActivePage={setActivePage} />
      </aside>

      <main className="w-full md:w-3/4 p-6 min-w-0">{renderContent()}</main>
    </div>
  );
};

export default UserProfilePage;
