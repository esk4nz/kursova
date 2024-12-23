"use client";

import React, { useState } from "react";
import AddCityModal from "@/components/restaurant/city/AddCityModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateCity } from "@/app/api/cities/cities";
import type { City } from "@/types/restaurant-components";

type EditCityButtonProps = {
  selectedCity: City | null;
  onUpdateCity: (updatedCity: City) => void;
};

const EditCityButton: React.FC<EditCityButtonProps> = ({
  selectedCity,
  onUpdateCity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateCity = async (updatedCity: City) => {
    try {
      const updatedData = await updateCity({
        id: updatedCity.id,
        city_name: updatedCity.city_name,
      });

      onUpdateCity(updatedData);
      setIsModalOpen(false);
      toast({
        title: "Успіх",
        description: "Назву міста успішно оновлено!",
      });
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося оновити місто.",
      });
    }
  };

  return (
    <>
      <Button
        variant="submit"
        disabled={!selectedCity}
        onClick={() => setIsModalOpen(true)}
        className="w-48"
      >
        Редагувати місто
      </Button>

      {isModalOpen && selectedCity && (
        <AddCityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddCity={() => {}}
          onUpdateCity={handleUpdateCity}
          editingCity={selectedCity}
        />
      )}
    </>
  );
};

export default EditCityButton;
