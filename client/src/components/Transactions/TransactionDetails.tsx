import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type Expense, useApiV1ExpenseExpenseIdDeleteExpenseMutation } from "../../services/api/v1";
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
				<TransactionContent
					transaction={transaction}
					setOpenDetails={setOpen}
				/>
			</MobileDrawer>
			<DesktopDialog
				title={transaction.title}
				open={open}
				setOpen={setOpen}
			>
				<TransactionContent
					transaction={transaction}
					setOpenDetails={setOpen}
				/>
			</DesktopDialog>
		</>
	);
};

const TransactionContent = ({
	transaction,
	setOpenDetails,
}: { transaction: Expense; setOpenDetails: (open: boolean) => void }) => {
	const { t } = useTranslation();
	const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
	const [deleteExpenseById] = useApiV1ExpenseExpenseIdDeleteExpenseMutation();

	const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");
	const currency = "JPY";
	const transactionAmountStr = `${currency} ${transaction.amount}`;

	const handleOnClickDelete = () => {
		setOpenConfirmDelete(true);
	};

	const handleOnClickDeleteCancel = () => {
		setOpenConfirmDelete(false);
	};

	const handleOnClickDeleteConfirm = () => {
		deleteExpenseById({
			expenseId: transaction.id,
		})
			.unwrap()
			.then(() => {
				setOpenDetails(false);
				setOpenConfirmDelete(false);
				// TODO: Add toast for success message
			})
			.catch((err) => {
				console.error(err);
				// TODO: Add toast for error message
			});
	};

	return (
		<>
			<Stack
				direction="column"
				gap={1}
			>
				{openConfirmDelete ? (
					<>
						<Typography>{t("transactions.delete.confirmation")}</Typography>
						<Box
							sx={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: { sm: "space-between", md: "end" },
								gap: 1,
							}}
						>
							<Button
								sx={{
									textTransform: "none",
									width: {
										xs: "100%",
										md: "fit-content",
									},
								}}
								variant="contained"
								color="secondary"
								onClick={handleOnClickDeleteCancel}
							>
								{t("common.button.cancel")}
							</Button>
							<Button
								sx={{
									textTransform: "none",
									width: {
										xs: "100%",
										md: "fit-content",
									},
								}}
								variant="contained"
								color="error"
								onClick={handleOnClickDeleteConfirm}
							>
								{t("common.button.confirm")}
							</Button>
						</Box>
					</>
				) : (
					<>
						<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.description")}</Typography>
						<Typography>{transaction.description}</Typography>
						<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.amount")}</Typography>
						<Typography>{transactionAmountStr}</Typography>
						<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
							{t("transactions.details.date-of-transaction")}
						</Typography>
						<Typography>{date}</Typography>
						<Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.category")}</Typography>
						<Typography>{transaction.category.name}</Typography>
						<Box
							sx={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: { sm: "space-between", md: "end" },
								gap: 1,
							}}
						>
							<Button
								sx={{
									textTransform: "none",
									width: {
										xs: "100%",
										md: "fit-content",
									},
								}}
								variant="contained"
								color="error"
								startIcon={<DeleteOutlined />}
								onClick={handleOnClickDelete}
							>
								{t("common.button.delete")}
							</Button>
							<Button
								sx={{
									textTransform: "none",
									width: {
										xs: "100%",
										md: "fit-content",
									},
								}}
								variant="contained"
								color="primary"
								startIcon={<EditOutlined />}
							>
								{t("common.button.edit")}
							</Button>
						</Box>
					</>
				)}
			</Stack>
		</>
	);
};
