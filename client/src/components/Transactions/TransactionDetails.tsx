import { Stack, Typography } from "@mui/material";
import type { TransactionType } from "../../pages/Transactions";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { DateTime } from "luxon";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	transaction: TransactionType;
}

// TODO: switch to use actual transaction type
export const TransactionDetails = ({ open, setOpen, transaction }: Props) => {
	return (
		<>
			<MobileDrawer
				title={transaction.title}
				open={open}
				setOpen={setOpen}
			>
				<TransactionContent transaction={transaction} />
			</MobileDrawer>
			<DesktopDialog
				title={transaction.title}
				open={open}
				setOpen={setOpen}
			>
				<TransactionContent transaction={transaction} />
			</DesktopDialog>
		</>
	);
};

const TransactionContent = ({ transaction }: { transaction: TransactionType }) => {
	const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");
	return (
		<Stack
			direction="column"
			gap={1}
		>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>Description</Typography>
			<Typography>{transaction.description}</Typography>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>Amount</Typography>
			<Typography>{transaction.amount} JPY</Typography>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>Date of transaction</Typography>
			<Typography>{date}</Typography>
		</Stack>
	);
};
