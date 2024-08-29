import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../lib/supabase/supabase";

export const baseApiV1 = createApi({
    baseQuery: fetchBaseQuery({
        credentials: "include",
        prepareHeaders: async (headers) => {
            // handle access token for backend to authenticate requests
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error) throw error;
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
