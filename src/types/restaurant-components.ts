export type Table = {
  id: number;
  table_number: number;
  capacity: number;
  status: "free" | "reserved" | "occupied";
};

export type City = {
  id: number;
  city_name: string;
};

export type Address = {
  isTemporary?: any;
  id: number;
  street_name: string;
  building_number: string;
};

export type CityAdd = {
  id: number;
  city_name: string;
  isTemporary?: boolean;
};
