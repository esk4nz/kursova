"use client";

import ReservationsTable from "./PersonReservationsTable";

const ReservationsPage = () => {
  return (
    <div className="bg-white p-5 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Ваші резервації</h2>
      <ReservationsTable />
    </div>
  );
};

export default ReservationsPage;
