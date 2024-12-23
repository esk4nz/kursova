export type CategoryType = {
  id: number;
  name: string;
};

export type MenuItemType = {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  photoUrl?: string;
};

export type MenuItemProps = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};
