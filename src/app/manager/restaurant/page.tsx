import RestaurantPageClient from "@/components/restaurant/RestaurantPageClient";

const RestaurantPage = () => {
  return (
    <div className="w-full bg-white rounded-lg">
      <h2 className="text-3xl font-bold text-center mt-6 pt-6 mb-4">
        Управління рестораном
      </h2>
      <RestaurantPageClient />
    </div>
  );
};

export default RestaurantPage;
