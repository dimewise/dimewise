import { Box, List } from "@mui/material";
import { useState } from "react";
import { TransactionFormPopup } from "../components/Transactions/TransactionFormPopup";
import { TransactionNavbar } from "../components/Transactions/TransactionNavbar";
import { TransactionListItem } from "../components/Transactions/TransactionListItem";
import { DateTime } from "luxon";

// INFO: Ideally the API should return TransactionType
// TODO: Remove this once API is in place for getting transactions
export type CategoryType = {
	id: string;
	name: string;
};
export type TransactionType = {
	id: string;
	title: string;
	description: string;
	amount: string;
	date: string;
	category: CategoryType;
};
const fakeTransactions: TransactionType[] = [
	{
		id: "b9fabc70-2bc9-4b84-a196-0c674bbd5657",
		title: "Grocery Shopping",
		description: "Bought groceries for the week",
		amount: "7550",
		date: "2024-09-01T00:00:00.000Z",
		category: {
			id: "f12d96e2-39ef-4f2c-80f5-1f7b3f2528a5",
			name: "Food",
		},
	},
	{
		id: "f72d9d6b-5b9d-4b90-b2a5-8b8d8b992c7f",
		title: "Gym Membership",
		description: "Monthly gym membership fee",
		amount: "3000",
		date: "2024-09-02T00:00:00.000Z",
		category: {
			id: "273adc3e-489b-4c7d-9c65-8f7eaf3ad5a9",
			name: "Fitness",
		},
	},
	{
		id: "a5cfa34b-1a2e-4a9a-a9df-0f346ab9fbdb",
		title: "Online Course",
		description: "Purchased an online course for programming",
		amount: "10000",
		date: "2024-09-03T00:00:00.000Z",
		category: {
			id: "4c68a81d-6f1e-4344-859b-e7fcbc3d4415",
			name: "Education",
		},
	},
	{
		id: "fae7d590-e2b0-4b3b-8ba2-06ad473e4fd5",
		title: "Coffee Shop",
		description: "Morning coffee at local cafe",
		amount: "575",
		date: "2024-09-04T00:00:00.000Z",
		category: {
			id: "6e2b14fc-8b8d-47f9-b869-cd72fcee5de7",
			name: "Entertainment",
		},
	},
	{
		id: "be7f34da-9c0f-4b6a-b2df-318d3ad9b688",
		title: "Phone Bill",
		description: "Monthly phone service payment",
		amount: "5000",
		date: "2024-09-05T00:00:00.000Z",
		category: {
			id: "0a5d6d80-fcc1-43a9-b1c5-13f6a679ee13",
			name: "Utilities",
		},
	},
];

export const Transactions = () => {
	const [open, setOpen] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState(DateTime.now());

	// TODO: add get transactions API call here
	const transactions = fakeTransactions;

	const handleOnClickCreate = () => {
		setOpen(true);
	};

	return (
		<Box sx={{ px: 3, width: "100%", maxWidth: { sm: "100%", md: "1700px" }, overflowY: "auto", pt: { xs: 8, md: 0 } }}>
			<TransactionNavbar
				selectedMonth={selectedMonth}
				setSelectedMonth={setSelectedMonth}
				handleOnClickCreate={handleOnClickCreate}
			/>
			<Box sx={{ overflowY: "auto", pb: 3 }}>
				<List>
					{transactions.map((t) => (
						<TransactionListItem
							key={t.id}
							transaction={t}
						/>
					))}
				</List>
			</Box>
			<TransactionFormPopup
				open={open}
				setOpen={setOpen}
			/>
		</Box>
	);
};
