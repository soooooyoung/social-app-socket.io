export interface User {
  userId?: number;
  username?: string;
  password?: string;
  statusCode?: "A" | "I";
  typeCode?: "E" | "K" | "N" | "G";
  created_date?: string;
  nickname?: string;
  email?: string;
  profileImgUrl?: string | null;
  intro?: string;
}
