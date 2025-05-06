import { supabase } from "@/lib/supabase";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApiV1 = createApi({
  baseQuery: fetchBaseQuery({
    // backend will be a different domain
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
    credentials: "include",
    prepareHeaders: async (headers) => {
      // handle access token for backend to authenticate requests
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }

      // handle type of response and request
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
