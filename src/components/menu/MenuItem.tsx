import React from "react";
import { MenuItemProps } from "@/types/menu";

const MenuItem: React.FC<MenuItemProps> = ({
  name,
  description,
  price,
  image,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
      <img
        src={image}
        alt={name}
        className="w-full aspect-square object-cover rounded-t-lg mb-4"
      />
      <h2 className="text-2xl font-semibold mb-2 break-words">{name}</h2>
      <p className="text-gray-600 mb-4 break-words">{description}</p>
      <div className="mt-auto">
        <p className="text-lg font-bold">{price} грн</p>
      </div>
    </div>
  );
};

export default MenuItem;
