import { Stack, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";
import type { Expense } from "../../services/api/v1";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	transaction: Expense;
}

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

const TransactionContent = ({ transaction }: { transaction: Expense }) => {
	const { t } = useTranslation();
	const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");
	const currency = "JPY";
	const transactionAmountStr = `${currency} ${transaction.amount}`;

	return (
		<Stack
			direction="column"
			gap={1}
		>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.description")}</Typography>
			<Typography>{transaction.description}</Typography>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.amount")}</Typography>
			<Typography>{transactionAmountStr}</Typography>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.date-of-transaction")}</Typography>
			<Typography>{date}</Typography>
			<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.category")}</Typography>
			<Typography>{transaction.category.name}</Typography>
		</Stack>
	);
};
