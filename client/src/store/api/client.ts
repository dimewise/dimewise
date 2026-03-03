import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import qs from "qs";

// Custom parameter serializer
//biome-ignore lint/suspicious/noExplicitAny: needed for generic serializer
const paramsSerializer = (params: Record<string, any>): string => {
	return qs.stringify(params, { arrayFormat: "repeat", skipNulls: true });
};

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const api = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: API_URL,
		credentials: "include",
		prepareHeaders: async (headers) => {
			const clerk = window.Clerk;
			if (clerk?.session) {
				const token = await clerk.session.getToken();
				if (token) {
					headers.set("Authorization", `Bearer ${token}`);
				}
			}

			headers.set("Accept", "application/json");
			headers.set("Content-Type", "application/json");
			return headers;
		},
		paramsSerializer: paramsSerializer,
	}),
	reducerPath: "api",
	refetchOnFocus: true,
	refetchOnReconnect: true,
	endpoints: () => ({}),
});
