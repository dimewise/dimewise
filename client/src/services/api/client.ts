import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useAuth } from "../../hooks/useAuth";

export const baseApiV1 = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/v1",
        credentials: "include",
        prepareHeaders: (headers) => {
            // handle access token for backend to authenticate requests
            const { session } = useAuth();
            if (session?.access_token) {
                headers.set("Authorization", `Bearer ${session.access_token}`)
            }

            // handle type of response and request
            headers.set("Accept", "application/json");
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    endpoints: () => ({}),
});
