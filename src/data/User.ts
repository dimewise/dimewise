import type { Currencies } from "@prisma/client";
import { supabase } from "../auth/AuthProvider";

export const User = {
	create: async (authId: string, email: string, name: string, defaultCurrency: Currencies) =>
		await supabase.from("User").insert({ authId, email, name, defaultCurrency }),
};
