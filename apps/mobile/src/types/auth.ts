export type AuthUser = {
  id: string;
  email: string;
  is_pro: boolean;
  created_at?: string;
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  token_type: 'bearer';
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
