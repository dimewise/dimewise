import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import type { TransactionType } from "../pages/Transactions";
import { TransactionDetails } from "./Transactions/TransactionDetails";

interface Props {
	transaction: TransactionType;
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
