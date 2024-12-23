"use client";

import { Review } from "@/types/review";
import { useEffect, useState } from "react";
import LoadingReviewsList from "./LoadingReviewsList";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddReviewForm from "./AddReviewForm";
import DeleteReviewModal from "./DeleteReviewModal";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";

const ReviewsList = ({
  refreshTrigger,
  currentUser,
}: {
  refreshTrigger: boolean;
  currentUser: { id: number } | null;
}) => {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [userOnly, setUserOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const { toast } = useToast();
  const reviewsPerPage = 10;
  const { data: session } = useSession();
  const isManagerOrAdmin =
    session?.user.userRole === "Manager" || session?.user.userRole === "Admin";

  const fetchReviews = () => {
    if (isLoading) return;
    setIsLoading(true);
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: reviewsPerPage.toString(),
      rating: filterRating ? filterRating.toString() : "",
      sort: sortOrder,
      userOnly: userOnly && currentUser ? "true" : "",
      userId: currentUser ? currentUser.id.toString() : "",
    }).toString();

    fetch(`/api/reviews?${queryParams}`)
      .then((res) => res.json())
      .then(({ reviews, totalPages }) => {
        setReviews(reviews);
        setTotalPages(totalPages);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filterRating, sortOrder, refreshTrigger, userOnly]);

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <span
          key={star}
          className={`text-2xl ${
            star <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteClick = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (reviewId: number) => {
    if (!reviewId) {
      console.error("ID відгуку не встановлено.");
      return;
    }
    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Не вдалося видалити відгук.");
      }
      toast({
        title: "Успіх",
        description: "Відгук успішно видалено!",
      });
      fetchReviews();
    } catch (error) {
      console.error(error);
      toast({
        title: "Упс",
        description: "Помилка при видаленні відгуку.",
      });
    }
    setIsDeleteModalOpen(false);
    setSelectedReviewId(null);
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };

  return (
    <div className="space-y-4">
      {/* Фільтри та сортування */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <label>Фільтрувати за рейтингом:</label>
          <select
            className="p-2 border rounded"
            value={userOnly ? "my" : filterRating ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "my") {
                if (currentUser) {
                  setFilterRating(null);
                  setUserOnly(true);
                } else {
                  alert(
                    "Ви повинні увійти в систему, щоб переглянути свої відгуки"
                  );
                }
              } else {
                setFilterRating(value ? Number(value) : null);
                setUserOnly(false);
              }
              setCurrentPage(1);
            }}
          >
            <option key="all" value="">
              Усі
            </option>
            {currentUser && !isManagerOrAdmin && (
              <option key="my" value="my">
                Мої
              </option>
            )}
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating} ★
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label>Сортувати за датою:</label>
          <select
            className="p-2 border rounded"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              setCurrentPage(1);
            }}
          >
            <option value="desc">Новіші</option>
            <option value="asc">Старіші</option>
          </select>
        </div>
      </div>
      {isLoading || reviews === null ? (
        <LoadingReviewsList />
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-500">Відгуків не існує</div>
      ) : (
        <>
          {reviews.length === 0 ? (
            <div className="text-center text-gray-500">Відгуків не існує</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded shadow">
                <div className="text-sm text-gray-600 font-semibold">
                  {review.users?.first_name || "Anonymous"}
                </div>
                <div>{renderStars(review.rating)}</div>
                <p className="text-gray-800 break-all">{review.comment}</p>
                {review.edited_at ? (
                  <>
                    {new Date(review.edited_at).toLocaleString()}{" "}
                    (відредаговано)
                  </>
                ) : (
                  <>{new Date(review.created_at).toLocaleString()}</>
                )}

                {(currentUser?.id == review.user_id || isManagerOrAdmin) && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEditClick(review)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="Редагувати"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(review.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Видалити"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Пагінація */}
          {reviews.length > 0 && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="cancel"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Попередня
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Button
                    variant={currentPage === page ? "submit" : "cancel"}
                    key={page}
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="cancel"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Наступна
              </Button>
            </div>
          )}
        </>
      )}
      {isModalOpen && editingReview && currentUser && (
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
              userId={currentUser.id}
              initialData={{
                id: editingReview.id,
                rating: editingReview.rating,
                comment: editingReview.comment || "",
              }}
              onReviewAdded={() => {
                closeModal();
                fetchReviews();
              }}
            />
          </div>
        </div>
      )}
      {isDeleteModalOpen && selectedReviewId && (
        <DeleteReviewModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleConfirmDelete(selectedReviewId)}
        />
      )}
    </div>
  );
};

export default ReviewsList;
