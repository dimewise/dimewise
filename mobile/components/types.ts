import type { Category } from "../db/schema";

export interface CategoryWithSpending extends Category {
	spent: number;
	percentage: number;
}
