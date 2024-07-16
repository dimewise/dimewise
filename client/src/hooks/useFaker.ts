import type { CategoryInfo } from "../types/category";
import type { FakerType } from "../types/faker";

// TODO: remove faker once api is complete
const categories: CategoryInfo[] = [
	{
		id: "1c6a176b-9ce3-470c-9642-93eddb09dd3f",
		name: "Groceries",
		budget: 15000,
	},
	{
		id: "82b7484d-63f0-464f-ab9d-f4d370946f01",
		name: "Shopping",
		budget: 10000,
	},
	{
		id: "a1714200-bf84-4e82-80f5-6770e904cbaa",
		name: "Hobbies",
		budget: 15000,
	},
];

export const useFaker = (): FakerType => {
	return {
		categories: categories,
	};
};
