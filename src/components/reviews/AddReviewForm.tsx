"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ReviewFormData } from "@/types/review";
import { Button } from "@/components/ui/button";

const AddReviewForm = ({
  userId,
  onReviewAdded,
  initialData,
  onCancel,
}: {
  userId: number;
  onReviewAdded: () => void;
  initialData?: ReviewFormData;
  onCancel?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    defaultValues: initialData || {},
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const currentRating = watch("rating", 0);
  const isEditMode = !!initialData;

  const { toast } = useToast();

  useEffect(() => {
    if (initialData?.rating) {
      setValue("rating", initialData.rating);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: ReviewFormData) => {
    try {
      const response = await fetch(
        isEditMode ? `/api/reviews?id=${initialData?.id}` : "/api/reviews",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            user_id: Number(userId),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Помилка при ${isEditMode ? "редагуванні" : "додаванні"} відгуку`
        );
      }

      reset();
      toast({
        title: "Успіх",
        description: `Ваш відгук успішно ${isEditMode ? "оновлено" : "додано"}`,
      });
      onReviewAdded();
    } catch (error: any) {
      toast({
        title: "Помилка",
        description:
          error.message ||
          `Не вдалося ${isEditMode ? "оновити" : "додати"} відгук`,
      });
    }
  };

  const handleRatingClick = (rating: number) => {
    setValue("rating", rating);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-2 font-semibold">
          Рейтинг <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
            <span
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleRatingClick(star)}
              className={`cursor-pointer text-2xl ${
                (hoverRating || currentRating) >= star
                  ? "text-yellow-500"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <input
          type="hidden"
          {...register("rating", {
            required: "Рейтинг обов'язковий для заповнення",
          })}
        />
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-2 font-semibold">Коментар</label>
        <textarea
          {...register("comment")}
          className="w-full p-2 border rounded"
          placeholder="Напишіть ваш коментар тут..."
        />
      </div>
      <Button variant="submit" type="submit">
        {isEditMode ? "Оновити" : "Надіслати"}
      </Button>
    </form>
  );
};

export default AddReviewForm;
