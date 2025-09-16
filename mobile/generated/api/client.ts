import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import qs from 'qs';

// Custom parameter serializer
//biome-ignore lint/suspicious/noExplicitAny: needed for generic serializer
const paramsSerializer = (params: Record<string, any>): string => {
  return qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true });
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
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
