'use client'
import axios from "axios";
import { useSession } from "next-auth/react";
import { base_url } from "./utils";

export const useSecureAxios = () => {
  const { data: session } = useSession();

  const instance = axios.create({
    baseURL: base_url,
  });

 
  instance.interceptors.request.use((config) => {
    const token = session?.user?.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};
