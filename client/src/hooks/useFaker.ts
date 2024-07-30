// TODO: remove faker once api is complete
//
export interface CategoryBase {
	id: string;
	name: string;
	budget: number;
}

export interface CategoryFull {
	id: string;
	name: string;
	budget: number;
	expense: number;
}

export interface Transactions {
	id: string;
	categoryId: string;
	title: string;
	price: number;
}

export interface Overview {
	categories: CategoryFull[];
	recentTransactions: Transactions[];
}

export interface FakerType {
	categories: CategoryBase[];
	overview: Overview;
}

const categories: CategoryBase[] = [
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

const overview: Overview = {
	categories: [
		{
			id: "1c6a176b-9ce3-470c-9642-93eddb09dd3f",
			name: "Groceries",
			budget: 15000,
			expense: 14000,
		},
		{
			id: "82b7484d-63f0-464f-ab9d-f4d370946f01",
			name: "Shopping",
			budget: 10000,
			expense: 400,
		},
		{
			id: "a1714200-bf84-4e82-80f5-6770e904cbaa",
			name: "Hobbies",
			budget: 15000,
			expense: 300,
		},
		{
			id: "b2e2a27b-ec13-4fdc-9538-4d55e2c1f58d",
			name: "Entertainment",
			budget: 20000,
			expense: 12000,
		},
		{
			id: "e49e5e7b-51b7-4e74-95a2-594d939c9d3e",
			name: "Utilities",
			budget: 8000,
			expense: 5000,
		},
	],
	recentTransactions: [
		{
			id: "d7c3d68d-4a5d-4a0d-8e5c-8fd92fa22b25",
			categoryId: "1c6a176b-9ce3-470c-9642-93eddb09dd3f",
			title: "Weekly groceries",
			price: 5000,
		},
		{
			id: "e1f26d1a-d8f8-4d3e-97b1-2d908ebf36a1",
			categoryId: "1c6a176b-9ce3-470c-9642-93eddb09dd3f",
			title: "Vegetables and fruits",
			price: 3000,
		},
		{
			id: "bb5f1657-5157-4f4f-98a0-3e2a5363bde7",
			categoryId: "1c6a176b-9ce3-470c-9642-93eddb09dd3f",
			title: "Meat and dairy",
			price: 6000,
		},
		{
			id: "9b574bcc-1b0b-4f18-a2ff-2179c5588d67",
			categoryId: "82b7484d-63f0-464f-ab9d-f4d370946f01",
			title: "Clothes shopping",
			price: 200,
		},
		{
			id: "b8575c3f-d6d1-4f8b-9f14-52e5b4c7e9f6",
			categoryId: "82b7484d-63f0-464f-ab9d-f4d370946f01",
			title: "Accessory purchase",
			price: 200,
		},
		{
			id: "5db99c43-4c8d-4d6e-b7db-5f3e1979f0de",
			categoryId: "a1714200-bf84-4e82-80f5-6770e904cbaa",
			title: "New paint set",
			price: 100,
		},
		{
			id: "3e04b7f1-f7eb-4c7c-8e7d-5e0ad7d71557",
			categoryId: "a1714200-bf84-4e82-80f5-6770e904cbaa",
			title: "Guitar strings",
			price: 200,
		},
		{
			id: "f72d36d5-71b1-41d4-bff7-5f509a4f6b8d",
			categoryId: "b2e2a27b-ec13-4fdc-9538-4d55e2c1f58d",
			title: "Movie tickets",
			price: 4000,
		},
		{
			id: "d8c3a456-67d8-4a1f-bf91-6ed314f1786f",
			categoryId: "b2e2a27b-ec13-4fdc-9538-4d55e2c1f58d",
			title: "Concert tickets",
			price: 8000,
		},
		{
			id: "a9e7a9d5-6b4f-4888-9ebf-2d5bb58c9d71",
			categoryId: "e49e5e7b-51b7-4e74-95a2-594d939c9d3e",
			title: "Electricity bill",
			price: 3000,
		},
		{
			id: "b8d3d6d5-8a7f-44d4-8c5a-3e1d5c6b8b6d",
			categoryId: "e49e5e7b-51b7-4e74-95a2-594d939c9d3e",
			title: "Water bill",
			price: 2000,
		},
	],
};

export const useFaker = (): FakerType => {
	return {
		categories: categories,
		overview: overview,
	};
};
