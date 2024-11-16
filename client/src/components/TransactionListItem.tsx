import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import type { Expense } from "../services/api/v1";
import { TransactionDetails } from "./Transactions/TransactionDetails";

interface Props {
	transaction: Expense;
}

// TODO: switch to use account currency instead of hardcoded JPY
export const TransactionListItem = ({ transaction }: Props) => {
	const [open, setOpen] = useState(false);
	const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");

	const handleOnClickTransaction = () => {
		setOpen(true);
	};

	return (
		<>
			<ListItem disablePadding>
				<ListItemButton onClick={handleOnClickTransaction}>
					<ListItemText
						primary={transaction.title}
						secondary={date}
					/>
					<Typography>- {transaction.amount} JPY</Typography>
				</ListItemButton>
			</ListItem>
			<TransactionDetails
				open={open}
				setOpen={setOpen}
				transaction={transaction}
			/>
		</>
	);
};
