import AddIcon from "@mui/icons-material/Add";
import { Box, Button, List } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TransactionListItem } from "../components/TransactionListItem";
import { MonthNavigator } from "../components/Transactions/MonthNavigator";
import { TransactionFormPopup } from "../components/Transactions/TransactionFormPopup";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";
import { useApiV1ExpenseGetExpensesQuery } from "../services/api/v1";

export const Transactions = () => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState(DateTime.now());
	// TODO: get based on selectedMonth
	const { data: transactions, refetch: refetchGetTransactions } = useApiV1ExpenseGetExpensesQuery();

	const handleOnClickCreate = () => {
		setOpen(true);
	};

	const handleSubmitCreateTransaction = () => {
		refetchGetTransactions();
		setOpen(false);
	};

	return (
		<>
			<PageNavbar
				title={t("nav.private.transactions")}
				secondaryAction={
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={handleOnClickCreate}
					>
						{t("common.button.create")}
					</Button>
				}
				secondaryTitle={
					<MonthNavigator
						selectedMonth={selectedMonth}
						setSelectedMonth={setSelectedMonth}
					/>
				}
			/>
			<Box sx={{ overflowY: "auto", pb: 3 }}>
				<List>
					{transactions?.map((t) => (
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
				handleClose={handleSubmitCreateTransaction}
			/>
		</>
	);
};
