import { api } from "./axios";
import type { User } from "@/types";

type ApiOk<T> = { success: true; data: T };

export const fetchMe = async (token: string) => {
  const response = await api.get<ApiOk<User>>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const updateMe = async (payload: Partial<User>, token: string) => {
  const response = await api.put<ApiOk<User>>("/users/me", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const fetchUserProfile = async (id: string) => {
  const response = await api.get<ApiOk<User>>(`/users/${id}`);
  return response.data.data;
};

