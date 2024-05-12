import { supabase } from "../auth/AuthProvider";

export const Category = {
	create: async (accountId: number, name: string, budget: number) =>
		await supabase.from("Category").insert({ accountId, budget, name }),
};
