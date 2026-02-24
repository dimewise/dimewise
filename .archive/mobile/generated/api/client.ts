import { getClerkInstance } from '@clerk/clerk-expo';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import qs from 'qs';

// Custom parameter serializer
//biome-ignore lint/suspicious/noExplicitAny: needed for generic serializer
const paramsSerializer = (params: Record<string, any>): string => {
  return qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true });
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/v1';

// Log the API URL for debugging (only in development)
if (__DEV__) {
  console.log('[API Client] Base URL:', BASE_URL);
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: async (headers) => {
      const clerkInstance = getClerkInstance();
      const token = await clerkInstance.session?.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    paramsSerializer: paramsSerializer,
  }),
  reducerPath: './api.ts',
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
