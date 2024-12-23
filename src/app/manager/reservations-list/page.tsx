import ReservationsListTable from "@/components/reservations-list/ReservationsListTable";

const ReservationsListPage = () => {
  return (
    <div className="w-full bg-white rounded-lg">
      <h2 className="text-3xl font-bold text-center mt-6 pt-6">Резервації</h2>
      <ReservationsListTable />
    </div>
  );
};

export default ReservationsListPage;
