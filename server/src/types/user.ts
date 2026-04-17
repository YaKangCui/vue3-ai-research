export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type UserCreateInput = {
  email: string;
  name: string;
};

export type UserUpdateInput = {
  email?: string;
  name?: string;
};
