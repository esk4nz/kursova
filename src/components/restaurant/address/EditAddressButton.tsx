import React, { useState } from "react";
import AddAddressModal from "@/components/restaurant/address/AddAddressModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateAddress } from "@/app/api/addresses/addresses";
import { Address } from "@/types/restaurant-components";

type EditAddressButtonProps = {
  selectedAddress: Address | null;
  cityId: number;
  onUpdateAddress: (updatedAddress: Address) => void;
};

const EditAddressButton: React.FC<EditAddressButtonProps> = ({
  selectedAddress,
  cityId,
  onUpdateAddress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateAddress = async (updatedAddress: {
    street_name: string;
    building_number: string;
  }) => {
    if (!selectedAddress || !cityId) {
      toast({
        title: "Помилка",
        description: "Адреса або місто не вибрані.",
      });
      return;
    }

    try {
      const updatedData = await updateAddress({
        id: selectedAddress.id,
        street_name: updatedAddress.street_name,
        building_number: updatedAddress.building_number,
        city_id: cityId,
      });

      onUpdateAddress({
        id: selectedAddress.id,
        street_name: updatedData.street_name,
        building_number: updatedData.building_number,
      });

      setIsModalOpen(false);
      toast({
        title: "Успіх",
        description: "Адресу успішно оновлено!",
      });
    } catch (error: any) {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося оновити адресу.",
      });
    }
  };

  return (
    <>
      <Button
        variant="submit"
        disabled={!selectedAddress}
        onClick={() => setIsModalOpen(true)}
        className="w-48"
      >
        Редагувати адресу
      </Button>

      {isModalOpen && selectedAddress && (
        <AddAddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cityId={cityId}
          editingAddress={selectedAddress}
          onAddAddress={handleUpdateAddress}
        />
      )}
    </>
  );
};

export default EditAddressButton;
