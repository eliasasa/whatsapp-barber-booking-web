export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user?: AuthUser;
  admin?: AuthUser;
};

export type UpdateEmailPayload = {
  email: string;
  currentPassword: string;
};

export type UpdateCredentialsPayload = {
  email: string;
  password: string;
  currentPassword: string;
};

export type MeResponse = {
  user?: AuthUser;
  admin?: AuthUser;
};
