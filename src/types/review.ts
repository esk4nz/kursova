export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  edited_at: string | null;
  user_id: number;
  users: {
    first_name: string | null;
  };
};
export type ReviewFormData = {
  id?: number;
  rating: number;
  comment: string;
};
