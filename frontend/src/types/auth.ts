export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type MessageResponse = {
  message: string;
};

export type SignupPayload = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type UpdateUsernamePayload = {
  current_username: string;
  new_username: string;
};

export type UpdatePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type DeleteAccountPayload = {
  identifier: string;
  password: string;
};
