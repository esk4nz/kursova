"use client";

import { useState } from "react";
import ReviewsList from "@/components/reviews/ReviewsList";
import AddReviewForm from "@/components/reviews/AddReviewForm";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
const ReviewsPage = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { data: session } = useSession();
  const isManagerOrAdmin =
    session?.user.userRole === "Manager" || session?.user.userRole === "Admin";

  const handleAddReviewClick = () => {
    if (!session) {
      toast({
        title: "Упс",
        description:
          "Ви повинні увійти, щоб залишити відгук. Перейдіть до авторизації.",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => !prev);
    closeModal();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Відгуки</h1>
        {!isManagerOrAdmin && (
          <Button variant="submit" onClick={handleAddReviewClick}>
            Додати відгук
          </Button>
        )}
      </div>
      <ReviewsList
        refreshTrigger={refreshTrigger}
        currentUser={session?.user.id ? { id: session.user.id } : null}
      />

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-1/3 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 text-lg"
            >
              ✕
            </button>
            <AddReviewForm
              userId={session!.user.id}
              onReviewAdded={triggerRefresh}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
