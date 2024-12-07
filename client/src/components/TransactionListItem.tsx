import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import type { Expense } from "../services/api/v1";
import { TransactionDetails } from "./Transactions/TransactionDetails";

interface Props {
	transaction: Expense;
	disallowOpen?: boolean;
}

// TODO: switch to use account currency instead of hardcoded JPY
export const TransactionListItem = ({ transaction, disallowOpen = false }: Props) => {
	const [open, setOpen] = useState(false);
	const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");

	const handleOpen = (open: boolean) => () => {
		if (disallowOpen) return;
		setOpen(open);
	};

	return (
		<>
			<ListItem disablePadding>
				<ListItemButton onClick={handleOpen(true)}>
					<ListItemText
						primary={transaction.title}
						secondary={date}
					/>
					<Typography>- {transaction.amount} JPY</Typography>
				</ListItemButton>
			</ListItem>
			<TransactionDetails
				open={open}
				handleClose={handleOpen(false)}
				transaction={transaction}
			/>
		</>
	);
};
